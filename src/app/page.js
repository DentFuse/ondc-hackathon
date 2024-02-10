"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function Home() {
  const [id, setId] = useState(null);
  const [title, setTitle] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [buyerName, setBuyer] = useState(null);
  const [sellerName, setSeller] = useState(null);
  const [frozen, setFrozen] = useState(false);
  const [score, setScore] = useState(0);
  const [role, setRole] = useState(null);
  useEffect(() => {
    document.getElementById("my_modal_1").showModal();
  }, []);
  useEffect(() => {
    let sum = 0;
    for (const i of conditions) {
      if (i.acceptedBuyer && i.acceptedSeller) sum++;
      else if (!i.acceptedBuyer && !i.acceptedSeller) sum--;
    }
    setScore(sum);
    if (conditions.length == 0) return;
    if(frozen) {
      return Swal.fire({
        title: "Frozen Transaction",
        text: "You may not edit any values.",
        icon: "info",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
    };
    if (sum == conditions.length) {
      // Deal Completed
      Swal.fire({
        title: "Complete Transaction?",
        text: "All parties have agreed to all the terms.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await get("/api/freezetransaction?id=" + id);
          MySwal.fire({
            title: "Transaction Completed!",
            icon: "success",
            text: "Transaction completed successfully as all parties have agreed to all the terms!",
          });
          setFrozen(true);
        }
      });
    } else if (sum == -1 * conditions.length) {
      // Deal Failed
      Swal.fire({
        title: "Decline Transaction?",
        text: "All parties have refused to all the terms.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await get("/api/freezetransaction?id=" + id);
          MySwal.fire({
            title: "Transaction Declined!",
            icon: "error",
            text: "Transaction declined as all parties have refused to all the terms!",
          });
          setFrozen(true);
        }
      });
    }
  }, [frozen, conditions, id]);
  return (
    <div className="p-10">
      <div className="alert alert-warning flex justify-center shadow-lg mb-6">
        <span className="text-2xl font-bold">Proof of Concept</span>
      </div>
      <div className="alert alert-success flex justify-center shadow-lg mb-6">
        <span className="text-2xl font-bold">Title: {title}</span>
        <span className="text-2xl font-bold">Transaction ID: {id}</span>
        <span className="text-2xl font-bold">Your Role: {role}</span>
      </div>
      <div className="flex flex-row">
        <div className="alert alert-info flex justify-center shadow-lg mr-4">
          <span className="text-2xl font-bold">Buyer: {buyerName}</span>
        </div>
        <div className="alert alert-info flex justify-center shadow-lg ml-4">
          <span className="text-2xl font-bold">Seller: {sellerName}</span>
        </div>
        <div
          className="tooltip w-full"
          data-tip="A negative score indicates divergence, 0 is neutral, positive score indicates convergence"
        >
          <div className="alert alert-info flex justify-center shadow-lg ml-4">
            <span className="text-2xl font-bold">Score: {score}</span>
          </div>
        </div>
      </div>

      <ModalRender
        setId={setId}
        setBuyer={setBuyer}
        setSeller={setSeller}
        setTitle={setTitle}
        setConditions={setConditions}
        setRole={setRole}
        setFrozen={setFrozen}
      />
      <ConditionsRenderer
        conditions={conditions}
        setConditions={setConditions}
        role={role}
        frozen={frozen}
      />
      <AddConditionModal
        id={id}
        conditions={conditions}
        setConditions={setConditions}
        role={role}
      />
      <div className="flex flex-row justify-between">
        <button
          className={frozen ? "hidden" : "btn btn-info "}
          onClick={() => document.getElementById("addCondition").showModal()}
        >
          Add Condition
        </button>
        <button
          className={frozen ? "hidden" : "btn btn-info "}
          onClick={() => loadWhileFetch(refreshData(id, setConditions, setFrozen))}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

async function loadWhileFetch(promise) {
  MySwal.fire({
    title: "Working...",
    icon: "info",
    allowEnterKey: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    text: "Please wait!",
    showConfirmButton: false
  });
  await promise;
  MySwal.close();
}

function refreshData(id, setConditions, setFrozen) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await getTransaction(id);
      setConditions(data.conditions);
      setFrozen(data.frozen);
      resolve();
    } catch (error) {
      reject(error);
    }
  })
}

function AddConditionModal({ id, conditions, setConditions, role }) {
  const [conditionError, setConditionError] = useState("input-border");
  return (
    <dialog id="addCondition" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Hello!</h3>
        <div className="label">
          <span className="label-text">What is the condition?</span>
        </div>
        <input
          className={"input w-full max-w-xs " + conditionError}
          id="conditionInput"
          placeholder="Leave empty if new transaction"
          type="text"
        />
        <div className="modal-action">
          {/* if there is a button in form, it will close the modal */}
          <button
            className="btn btn-error"
            onClick={() => document.getElementById("addCondition").close()}
          >
            Close
          </button>

          <button
            className="btn btn-success"
            onClick={() =>
              validateAndAddCondition(
                id,
                conditions,
                setConditions,
                setConditionError,
                role
              )
            }
          >
            Save
          </button>
        </div>
      </div>
    </dialog>
  );
}

async function validateAndAddCondition(
  id,
  conditions,
  setConditions,
  setConditionError,
  role
) {
  return new Promise(async (resolve, reject) => {
    try {
      const condi = document.getElementById("conditionInput").value;
      if (!condi) return resolve(setConditionError("input-error"));
      setConditionError("input-border");
      const body = {
        parent: id,
        content: condi,
        acceptedSeller: false,
        acceptedBuyer: false,
      };
      if (role == "Buyer") body.acceptedBuyer = true;
      else body.acceptedSeller = true;
      const res = await post("/api/addcondition", body);
      if (res.status != "ok") {
        return reject(res.message);
      }
      body._id = res.data.id;
      console.log(id, conditions);
      setConditions([...conditions, body]);
      document.getElementById("addCondition").close();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function ConditionsRenderer({ conditions, setConditions, role, frozen }) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra mb-4 text-center">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th className="font-2xl">Condition</th>
            <th className="font-2xl">Accepted by Seller</th>
            <th className="font-2xl">Accepted by Buyer</th>
            <th className="font-2xl">Actions</th>
          </tr>
        </thead>
        <tbody>
          {conditions.map((x, i) => {
            return (
              <tr key={x._id}>
                <th>{i + 1}</th>
                <td>{x.content}</td>
                <td>
                  {x.acceptedSeller ? (
                    role == "Seller" && !frozen ? (
                      <RejectConditionButton
                        condition={x}
                        role={role}
                        conditions={conditions}
                        setConditions={setConditions}
                      />
                    ) : (
                      "Yes"
                    )
                  ) : role == "Seller" && !frozen ? (
                    <AcceptConditionButton
                      condition={x}
                      role={role}
                      conditions={conditions}
                      setConditions={setConditions}
                    />
                  ) : (
                    "No"
                  )}
                </td>
                <td>
                  {x.acceptedBuyer ? (
                    role == "Buyer" && !frozen ? (
                      <RejectConditionButton
                        condition={x}
                        role={role}
                        conditions={conditions}
                        setConditions={setConditions}
                      />
                    ) : (
                      "Yes"
                    )
                  ) : role == "Buyer" && !frozen ? (
                    <AcceptConditionButton
                      condition={x}
                      role={role}
                      conditions={conditions}
                      setConditions={setConditions}
                    />
                  ) : (
                    "No"
                  )}
                </td>
                <td>
                  <button
                    className={frozen ? "hidden" : "btn btn-error"}
                    onClick={() =>
                      loadWhileFetch(deleteCondition(x._id, conditions, setConditions))
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RejectConditionButton({ condition, role, conditions, setConditions }) {
  return (
    <div>
      <span className="pr-4">Yes</span>

      <button
        className="btn btn-error"
        onClick={() => {
          loadWhileFetch(rejectCondition(condition, role, conditions, setConditions));
        }}
      >
        Reject
      </button>
    </div>
  );
}

function rejectCondition(condition, role, conditions, setConditions) {
  return new Promise(async (resolve, reject) => {
    try {
      if (role == "Buyer") {
        condition.acceptedBuyer = false;
      } else {
        condition.acceptedSeller = false;
      }
      condition.id = condition._id;
      const res = await post("/api/updatecondition", condition);
      if (res.status != "ok") {
        return reject(res.message);
      }
      setConditions(
        conditions.map((x) => {
          if (x._id != condition._id) return x;
          return condition;
        })
      );
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function AcceptConditionButton({ condition, role, conditions, setConditions }) {
  return (
    <div>
      <span className="pr-4">No</span>

      <button
        className="btn btn-success"
        onClick={() => {
          loadWhileFetch(acceptCondition(condition, role, conditions, setConditions));
        }}
      >
        Accept
      </button>
    </div>
  );
}

function acceptCondition(condition, role, conditions, setConditions) {
  return new Promise(async (resolve, reject) => {
    try {
      if (role == "Buyer") {
        condition.acceptedBuyer = true;
      } else {
        condition.acceptedSeller = true;
      }
      condition.id = condition._id;
      const res = await post("/api/updatecondition", condition);
      if (res.status != "ok") {
        return reject(res.message);
      }
      setConditions(
        conditions.map((x) => {
          if (x._id != condition._id) return x;
          return condition;
        })
      );
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function deleteCondition(id, conditions, setConditions) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await get("/api/deletecondition?id=" + id);
      console.log(res);
      if (res.status != "ok") {
        return reject(res.message);
      }
      setConditions(conditions.filter((e) => e._id != id));
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

function ModalRender({
  setId,
  setBuyer,
  setSeller,
  setTitle,
  setConditions,
  setRole,
  setFrozen
}) {
  const [val, setVal] = useState("select-bordered");
  const [buyerError, setBuyerError] = useState("input-bordered");
  const [sellerError, setSellerError] = useState("input-bordered");
  const [titleError, setTitleError] = useState("input-bordered");
  const [trans, setTrans] = useState("input-bordered");

  const [additional, setAdditional] = useState(true);
  return (
    <dialog id="my_modal_1" className="modal">
      <div className="modal-box py-5">
        <div className="alert alert-warning flex justify-center shadow-lg mb-4">
          <span className="text-2xl font-bold">Proof of Concept</span>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-xl">Welcome!</h3>
          <p className="py-4">Please fill the following for testing purposes</p>
          <div method="dialog">
            <div className="label">
              <span className="label-text">What is your role?</span>
            </div>
            <select
              className={"select w-full max-w-xs mb-4 " + val}
              id="role"
              defaultValue={"What is your role?"}
            >
              <option disabled>What is your role?</option>
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
            </select>
            <div className="label">
              <span className="label-text">Create new transaction?</span>
            </div>
            <>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Yes</span>
                  <input
                    type="radio"
                    name="radio-10"
                    className="radio checked:bg-blue-500"
                    checked={additional}
                    onChange={() => setAdditional(true)}
                  />
                </label>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">No</span>
                  <input
                    type="radio"
                    name="radio-10"
                    className="radio checked:bg-red-500"
                    checked={!additional}
                    onChange={() => setAdditional(false)}
                  />
                </label>
              </div>
            </>
            {additional ? (
              <DataTransaction
                buyer={buyerError}
                seller={sellerError}
                title={titleError}
              />
            ) : (
              <TransactionRender trans={trans} />
            )}

            <div className="modal-action">
              {/* if there is a button in form, it will close the modal */}
              <button
                className="btn"
                type="submit"
                onClick={() =>
                  validate(
                    additional,
                    setVal,
                    setBuyerError,
                    setSellerError,
                    setTitleError,
                    setTrans,
                    setId,
                    setBuyer,
                    setSeller,
                    setTitle,
                    setConditions,
                    setRole,
                    setFrozen
                  )
                }
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

function DataTransaction({ buyer, seller, title }) {
  return (
    <>
      <div>
        <div className="label">
          <span className="label-text">Enter buyer&apos;s name?</span>
        </div>
        <input
          className={"input w-full max-w-xs " + buyer}
          id="buyerName"
          placeholder="Buyer's Name"
          type="text"
        />
      </div>
      <div>
        <div className="label">
          <span className="label-text">Enter seller&apos;s name?</span>
        </div>
        <input
          className={"input w-full max-w-xs " + seller}
          id="sellerName"
          placeholder="Seller's Name"
          type="text"
        />
      </div>
      <div>
        <div className="label">
          <span className="label-text">Enter title for transaction?</span>
        </div>
        <input
          className={"input w-full max-w-xs " + title}
          id="title"
          placeholder="Title"
          type="text"
        />
      </div>
    </>
  );
}

function TransactionRender({ trans }) {
  return (
    <>
      <div className="label">
        <span className="label-text">What is the transaction ID?</span>
      </div>
      <input
        className={"input w-full max-w-xs " + trans}
        id="trans"
        placeholder="Transaction ID"
        type="text"
      />
    </>
  );
}

async function validate(
  additional,
  setVal,
  setBuyerError,
  setSellerError,
  setTitleError,
  setTrans,
  setId,
  setBuyer,
  setSeller,
  setTitle,
  setConditions,
  setRole,
  setFrozen
) {
  let valid = true;
  let role = document.getElementById("role").value;
  let buyerName = document.getElementById("buyerName")?.value;
  let sellerName = document.getElementById("sellerName")?.value;
  let title = document.getElementById("title")?.value;
  let transID = document.getElementById("trans")?.value;
  if (role == "What is your role?") {
    setVal("select-error");
    valid = false;
  } else {
    setVal("select-bordered");
  }

  if (additional) {
    if (!buyerName) {
      setBuyerError("input-error");
      valid = false;
    } else {
      setBuyerError("input-bordered");
    }
    if (!sellerName) {
      setSellerError("input-error");
      valid = false;
    } else {
      setSellerError("input-bordered");
    }
    if (!title) {
      setTitleError("input-error");
      valid = false;
    } else {
      setTitleError("input-bordered");
    }
  } else {
    if (!transID) {
      setTrans("input-error");
      valid = false;
    } else {
      setTrans("input-bordered");
    }
  }
  if (!valid) return;
  if (additional) {
    const data = await saveTransaction(buyerName, sellerName, title);
    transID = data.id;
  }
  setId(transID);
  setRole(role);
  const data = await getTransaction(transID);
  setBuyer(data.buyer);
  setSeller(data.seller);
  setTitle(data.title);
  setFrozen(data.frozen);
  setConditions(data.conditions);
  document.getElementById("my_modal_1").close();
}

function saveTransaction(buyerName, sellerName, title) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await post("/api/addtransaction", {
        buyerName,
        sellerName,
        title,
        price: 1,
        frozen: false,
      });
      console.log(res);
      if (res.status != "ok") {
        return reject(res.message);
      }
      resolve(res.data);
    } catch (error) {
      reject(error);
    }
  });
}

function getTransaction(transID) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await get("/api/gettransaction?id=" + transID);
      console.log(res);
      if (res.status != "ok") {
        return reject(res.message);
      }
      resolve(res.data);
    } catch (e) {
      reject(e);
    }
  });
}

function post(url, body) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!url) throw new Error("Missing URL!");
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      };
      const response = await fetch(url, options);
      const output = await response.json();
      return resolve(output);
    } catch (error) {
      reject(error);
    }
  });
}

function get(url) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!url) throw new Error("Missing URL!");
      const response = await fetch(url);
      const output = await response.json();
      return resolve(output);
    } catch (error) {
      reject(error);
    }
  });
}

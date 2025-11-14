import { runTransaction, serverTimestamp, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";

// import { runTransaction }s frssom "firebssase/firestore";

// const biodataRef = collection(db, "IPaddress");

const add_data = async ({ sendData }) => {
  const data = { ...sendData, platform: "blog" };

  try {
    await runTransaction(db, async (transaction) => {
      const docRef = doc(db, "IPaddress", data.ip);

      const docSnapshot = await transaction.get(docRef);

      if (docSnapshot.exists()) {
        // Update existing documents
        transaction.update(docRef, {
          ...data,
          updatedTimeStamp: serverTimestamp(),
        });
      } else {
        // Add new document
        transaction.set(docRef, { ...data, timestamp: serverTimestamp() });
      }
    });

    // Reset the state
    // setSendData({ ip: "" });
  } catch (error) {
    console.error("Error adding or updating data:", error);
    // Handle error approprisately (e.g., display feedback to the user)
  }
};

export { add_data };

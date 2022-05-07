// This file allows for the offline storage of data in the browser's IndexedDB in the event the app is not connected to the online MongoDB due to connectivity issues

// Declares the variable to use for the db request
let db;

// Sets the variable for indexedDB
const request = indexedDB.open('pats_budget', 1);

// The methods below handle the specific db states
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};
request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.online) { 
        uploadTranscation();
    }
};
request.onerror = function(event) {
    // log error
    console.log(event.target.errorCode);
};

// This will add the record to the objectstore
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access the object store
    const budgetObjectStore = transaction.objectStore('new_transaction');

    // add record to your store with add method
    budgetObjectStore.add(record);

};

// Once the connectivity is restored, this will attempt to post the data in the object store to the online MongoDB
function uploadTranscation() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_transaction');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                  Accept: "application/json, text/plain, */*",
                  "Content-Type": "application/json"
                }
              })
              .then(response => response.json())
              .then(serverResponse => {
                if (serverResponse.message) {
                  throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_transaction');
                budgetObjectStore.clear();
                alert('All saved transaction have been submitted!');
              })
              .catch(err => {
                console.log(err)
              });
            }
    }
}

// Listen to detect when connectivity is restored 
window.addEventListener('online', uploadTranscation);
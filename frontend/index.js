// Your Firebase configuration (replace this with your actual config from Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyD5vOTBRuLYxRFi3svb2BnbxhCgOWcrlV8",
    authDomain: "device-manager-1bdd3.firebaseapp.com",
    databaseURL: "https://device-manager-1bdd3-default-rtdb.firebaseio.com",
    projectId: "device-manager-1bdd3",
    storageBucket: "device-manager-1bdd3.firebasestorage.app",
    messagingSenderId: "646019339606",
    appId: "1:646019339606:web:522cc0d8f43212bb8cf2f7",
    measurementId: "G-XDMW48S49C"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize the database
const db = firebase.database();

// Firebase reference for the devices collection
const devicesRef = db.ref("devices");

// Add a new device to Firebase
document.getElementById("add-name-btn").addEventListener("click", () => {
    const deviceName = document.getElementById("name-input").value;
    if (deviceName) {
        // Check if the button is in "Save Changes" mode
        if (document.getElementById("add-name-btn").textContent === "Save Changes") {
            // Save changes to an existing device
            const deviceId = document.getElementById("add-name-btn").getAttribute("data-id");
            devicesRef.child(deviceId).update({
                name: deviceName
            });
            document.getElementById("add-name-btn").textContent = "Add Device"; // Reset the button text
            document.getElementById("add-name-btn").removeAttribute("data-id"); // Clear the deviceId
        } else {
            // Get the next available device ID based on existing devices
            devicesRef.once("value", (snapshot) => {
                const devices = snapshot.val();
                let nextId = 1; // Start from 1 by default

                // Find the next available ID
                if (devices) {
                    const ids = Object.keys(devices);
                    const maxId = Math.max(...ids.map(id => parseInt(id, 10)));
                    nextId = maxId + 1; // Increment from the highest ID
                }

                // Add new device to Firebase with the new device ID
                devicesRef.child(nextId).set({
                    name: deviceName,
                    dateAdded: new Date().toISOString()
                });
            });
        }
        document.getElementById("name-input").value = ""; // Clear input
    }
});

// Load devices from Firebase and display in the table
devicesRef.on("value", (snapshot) => {
    const devices = snapshot.val();
    const tableBody = document.querySelector("#table tbody");
    tableBody.innerHTML = ""; // Clear the table

    if (devices) {
        Object.keys(devices).forEach((id) => {
            const device = devices[id];
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${id}</td>
                <td>${device.name}</td>
                <td>${new Date(device.dateAdded).toLocaleString()}</td>
                <td><button class="delete-btn" data-id="${id}">Delete</button></td>
                <td><button class="edit-btn" data-id="${id}" data-name="${device.name}">Edit</button></td>
            `;

            tableBody.appendChild(row);
        });

        // Add event listeners for the delete buttons
        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", (event) => {
                const deviceId = event.target.getAttribute("data-id");
                devicesRef.child(deviceId).remove(); // Remove the device from Firebase
            });
        });

        // Add event listeners for the edit buttons
        document.querySelectorAll(".edit-btn").forEach((button) => {
            button.addEventListener("click", (event) => {
                const deviceId = event.target.getAttribute("data-id");
                const deviceName = event.target.getAttribute("data-name");
                document.getElementById("name-input").value = deviceName; // Set input to current name
                document.getElementById("add-name-btn").textContent = "Save Changes"; // Change button to "Save Changes"
                document.getElementById("add-name-btn").setAttribute("data-id", deviceId); // Store deviceId in button
            });
        });
    } else {
        tableBody.innerHTML = "<tr><td colspan='5'>No devices found</td></tr>";
    }
});



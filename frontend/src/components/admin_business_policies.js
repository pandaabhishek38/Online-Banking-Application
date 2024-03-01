// admin_business_policies.js

console.log('Admin Business Policies Script Loaded!');

document.addEventListener("DOMContentLoaded", function () {
    fetchPolicyNames();

    const insertPolicyButton = document.getElementById('insertPolicyButton');
    const insertPolicyModal = document.getElementById('insertPolicyModal');
    const insertPolicyModalButton = document.getElementById('insertPolicyModalButton');
    const policyNameInput = document.getElementById('policyNameInput');
    const policyDescInput = document.getElementById('policyDescInput');

    insertPolicyButton.addEventListener('click', () => {
        // Open the modal
        insertPolicyModal.style.display = 'block';
    });

    insertPolicyModalButton.addEventListener('click', () => {
        // Get values from input boxes
        const newPolicyName = policyNameInput.value;
        const newPolicyDesc = policyDescInput.value;

        if (newPolicyName && newPolicyDesc) {
            insertPolicy({ Policy_Name: newPolicyName, Policy_Desc: newPolicyDesc })
                .then(() => {
                    // Close the modal after inserting
                    insertPolicyModal.style.display = 'none';
                    // Refresh the page after inserting
                    location.href = location.href;
                })
                .catch(error => {
                    console.error('Error inserting policy:', error);
                    alert('Failed to insert policy.');
                });
        } else {
            alert('Please enter both Policy Name and Description.');
        }
    });

    // Close the modal if the user clicks on the close button (×)
    const closeButton = document.getElementsByClassName('close')[0];
    closeButton.addEventListener('click', () => {
        insertPolicyModal.style.display = 'none';
    });

    // Close the modal if the user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target === insertPolicyModal) {
            insertPolicyModal.style.display = 'none';
        }
    });

    const filterInput = document.getElementById('policyFilter');
    filterInput.addEventListener('input', function () {
        // Call the function to filter the list based on the input value
        filterPolicyList(this.value.trim());
    });
});

function filterPolicyList(filterText) {
    const listItems = document.querySelectorAll('.list-item-box');

    listItems.forEach(item => {
        const itemName = item.querySelector('.list-item-name').textContent.toLowerCase();

        // Check if the filter text is found in the item name
        if (itemName.includes(filterText.toLowerCase())) {
            item.style.display = 'block';  // Show the item
        } else {
            item.style.display = 'none';   // Hide the item
        }
    });
}

function fetchPolicyNames() {
    const adminPolicyList = document.getElementById('adminPolicyList');

    fetch('http://localhost:8080/api/getAllPolicyNames')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                const adminPolicies = data.data;

                adminPolicies.forEach(policy => {
                    const listItemBox = document.createElement('div');
                    listItemBox.classList.add('list-item-box');

                    const listItem = document.createElement('div');
                    listItem.classList.add('list-item-name'); // Add the class for name styling
                    listItem.textContent = policy.Policy_Name;
                    listItemBox.appendChild(listItem);

                    // Add a div for description under each list item
                    const expandedDetailsContainer = document.createElement('div');
                    expandedDetailsContainer.classList.add('expanded-details-container');
                    listItemBox.appendChild(expandedDetailsContainer);

                    const descriptionDiv = document.createElement('div');
                    descriptionDiv.classList.add('expanded-details');
                    expandedDetailsContainer.appendChild(descriptionDiv);

                    const editDeleteContainer = document.createElement('div');
                    editDeleteContainer.classList.add('edit-delete-container');
                    expandedDetailsContainer.appendChild(editDeleteContainer);

                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.classList.add('edit-button');
                    editButton.addEventListener('click', () => {
                        // Replace the "Edit" button with an editable text box, "Save", and "Cancel" buttons
                        replaceWithEditableTextBox(policy.Policy_Name,descriptionDiv, editDeleteContainer, policy.Policy_Desc,editButton,deleteButton);
                    });
                    editDeleteContainer.appendChild(editButton);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('delete-button');
                    deleteButton.addEventListener('click', () => {
                        const confirmDeletion = confirm('Are you sure you want to delete this policy?');
                        if (confirmDeletion) {
                            deletePolicy(policy.Policy_Name)
                                .then(() => {
                                    // Your code to execute after deletePolicy is completed
                                    console.log('Deletion completed!');
                                    location.reload();
                                })
                                .catch(error => {
                                    // Handle errors if the deletion fails
                                    console.error('Error deleting policy:', error);
                                });

                        }
                    });
                    editDeleteContainer.appendChild(deleteButton);

                    listItemBox.addEventListener('click', () => {
                        // Toggle the visibility of the expanded details container
                        expandedDetailsContainer.classList.toggle('visible');

                        const policyName = encodeURIComponent(policy.Policy_Name);
                        displayPolicyDetails(policyName, descriptionDiv);
                    });

                    adminPolicyList.appendChild(listItemBox);
                });
            } else {
                const message = document.createElement('p');
                message.textContent = 'No admin policy names found.';
                adminPolicyList.appendChild(message);
            }
        })
        .catch(error => {
            console.error('Error fetching admin policy names:', error);
        });
}

function displayPolicyDetails(policyName, descriptionDiv) {
    // Fetch policy details using the policy name
    fetch(`http://localhost:8080/api/getPolicyDesc?policyname=${policyName}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                const policyDesc = data.data[0].Policy_Desc;
                descriptionDiv.innerHTML = `<p class="expanded-details">${policyDesc}</p>`;
            } else {
                descriptionDiv.innerHTML = '<p class="expanded-details">Policy details not found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching policy details:', error);
        });
}

function replaceWithEditableTextBox(policyName,descriptionDiv, editDeleteContainer, oldDesc, editButton,deleteButton) {
    // Stop click events from propagating to the parent (list item)
    editDeleteContainer.addEventListener('click', e => e.stopPropagation());
    editButton.style.display = "None"
    deleteButton.style.display = "None"
    // Retrieve the existing description
    const currentDesc = descriptionDiv.querySelector('.expanded-details').textContent;

    // Hide the descriptionDiv
    descriptionDiv.style.display = 'none';

    // Create a div to contain the input box and buttons
    const editContainer = document.createElement('div');
    editContainer.classList.add('edit-container');

    // Create an input element with the existing description as its initial value
    const inputBox = document.createElement('textarea');
    inputBox.value = currentDesc;
    inputBox.classList.add('editable-text-box');

    // Create "Save" button
    const saveButton = document.createElement('button');
    saveButton.classList.add('save-button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', async () => {
        const newDesc = inputBox.value;
        await saveEditedDescription(policyName,newDesc,descriptionDiv);
        location.reload(); // Reload the page after saving
    });

    // Create "Cancel" button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('cancel-button');
    cancelButton.addEventListener('click', () => {
        location.reload(); // Reload the page after canceling
    });

    // Append the input box, "Save", and "Cancel" buttons to the edit container
    editContainer.appendChild(inputBox);
    editContainer.appendChild(saveButton);
    editContainer.appendChild(cancelButton);

    // Append the edit container to the editDeleteContainer
    editDeleteContainer.appendChild(editContainer);
}


async function saveEditedDescription(policyName,newDesc,descriptionDiv) {
    const updateData = {
        Policy_Name: policyName,
        Policy_Desc: newDesc
    };
    //alert("here")
    await fetch('http://localhost:8080/api/updatePolicy', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Policy updated successfully!');
                // Refresh the details after updating
                const policyNameEncoded = encodeURIComponent(policyName);
                displayPolicyDetails(policyNameEncoded, descriptionDiv);
            } else {
                alert('Failed to update policy.');
            }
        })
        .catch(error => {
            console.error('Error updating policy:', error);
        });
}

async function deletePolicy(policyName) {
    //alert("here")
     await fetch(`http://localhost:8080/api/deletePolicy?policyname=${policyName}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Policy Deleted successfully!');
                // Refresh the details after updating
            } else {
                alert('Failed to update policy.');
            }
        })
        .catch(error => {
            console.error('Error updating policy:', error);
        });
}

async function insertPolicy(newPolicy) {
    await fetch('http://localhost:8080/api/insertPolicy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPolicy)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Policy inserted successfully!');
                // Refresh the list after inserting
                fetchPolicyNames();
            } else {
                const errorMessage = data && data.message ? data.message : 'Unknown error';
                alert(`Failed to insert policy. Error: ${errorMessage}`);
            }
        })
        .catch(error => {
            console.error('Error inserting policy:', error);
            alert('An error occurred while inserting the policy.');
        });
}
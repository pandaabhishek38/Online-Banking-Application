console.log('Script Start loaded!');

document.addEventListener("DOMContentLoaded", function () {
    fetchPolicyNames();
    const filterInput = document.getElementById('policyFilter');
    filterInput.addEventListener('input', function () {
        filterPolicyList(this.value.trim());
    });
});

async function filterPolicyList(filterText) {
    const listItems = document.querySelectorAll('.list-item-box');

    for (const item of listItems) {
        const itemName = item.querySelector('.list-item-name').textContent.toLowerCase();

        if (itemName.includes(filterText.toLowerCase())) {
            item.style.display = 'block';  // Show the item
        } else {
            item.style.display = 'none';   // Hide the item
        }
    }
}

async function fetchPolicyNames() {
    console.log('Script loaded!');

    const listContainer = document.getElementById('policyList');

    try {
        const response = await fetch('http://localhost:8080/api/getAllPolicyNames');
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            for (const policy of data.data) {
                const listItemBox = document.createElement('div');
                listItemBox.classList.add('list-item-box');

                const listItem = document.createElement('div');
                listItem.classList.add('list-item-name');
                listItem.textContent = policy.Policy_Name;
                listItemBox.appendChild(listItem);

                const expandedDetailsContainer = document.createElement('div');
                expandedDetailsContainer.classList.add('expanded-details-container');
                listItemBox.appendChild(expandedDetailsContainer);

                const descriptionDiv = document.createElement('div');
                descriptionDiv.classList.add('expanded-details');
                expandedDetailsContainer.appendChild(descriptionDiv);

                listItemBox.addEventListener('click', async () => {
                    expandedDetailsContainer.classList.toggle('visible');

                    const policyName = encodeURIComponent(policy.Policy_Name);
                    await displayPolicyDetails(policyName, descriptionDiv);
                });

                listContainer.appendChild(listItemBox);
            }
        } else {
            const message = document.createElement('p');
            message.textContent = 'No policy names found.';
            listContainer.appendChild(message);
        }
    } catch (error) {
        console.error('Error fetching policy names:', error);
        throw error;
    }
}

async function displayPolicyDetails(policyName, descriptionDiv) {
    try {
        const response = await fetch(`http://localhost:8080/api/getPolicyDesc?policyname=${policyName}`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const policyDesc = data.data[0].Policy_Desc;
            const formattedDesc = policyDesc.replace(/\n/g, '<br>');
            descriptionDiv.innerHTML = `<p class="expanded-details">${formattedDesc}</p>`;
        } else {
            descriptionDiv.innerHTML = '<p class="expanded-details">Policy details not found.</p>';
        }
    } catch (error) {
        console.error('Error fetching policy details:', error);
    }
}
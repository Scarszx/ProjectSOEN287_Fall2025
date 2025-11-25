// Fetch resources from server
fetch('/api/resources')
    .then(response => response.json())
    .then(resources => {
        const tbody = document.querySelector("#resource-table tbody");
        resources.forEach(resource => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${resource.resource_id}</td>
                <td>${resource.resource_name}</td>
                <td>${resource.resource_type}</td>
                <td>${resource.resource_description}</td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(err => console.error('Error fetching resources:', err));

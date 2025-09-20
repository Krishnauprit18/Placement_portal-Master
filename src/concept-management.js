document.addEventListener('DOMContentLoaded', () => {
    const addConceptForm = document.getElementById('addConceptForm');
    const conceptNameInput = document.getElementById('conceptName');
    const conceptDescriptionInput = document.getElementById('conceptDescription');
    const conceptsList = document.getElementById('conceptsList');
    const sourceConceptSelect = document.getElementById('sourceConcept');
    const targetConceptSelect = document.getElementById('targetConcept');
    const addRelationshipForm = document.getElementById('addRelationshipForm');
    const relationshipsList = document.getElementById('relationshipsList');

    let allConcepts = []; // To store concepts for dropdowns

    // Function to fetch and display concepts
    async function fetchConcepts() {
        try {
            const response = await fetch('/concepts');
            const data = await response.json();
            if (data.success) {
                allConcepts = data.concepts;
                conceptsList.innerHTML = ''; // Clear existing list
                sourceConceptSelect.innerHTML = '<option value="">Select Source Concept</option>';
                targetConceptSelect.innerHTML = '<option value="">Select Target Concept</option>';

                allConcepts.forEach(concept => {
                    const listItem = document.createElement('li');
                    listItem.className = 'list-group-item';
                    listItem.innerHTML = `
                        <div>
                            <strong>${concept.name}</strong> (ID: ${concept.id})<br>
                            <small>${concept.description || 'No description'}</small>
                        </div>
                    `;
                    conceptsList.appendChild(listItem);

                    const option = document.createElement('option');
                    option.value = concept.id;
                    option.textContent = `${concept.name} (ID: ${concept.id})`;
                    sourceConceptSelect.appendChild(option.cloneNode(true));
                    targetConceptSelect.appendChild(option);
                });
            } else {
                alert('Failed to fetch concepts: ' + data.message);
            }
        } catch (error) {
            console.error('Error fetching concepts:', error);
            alert('An error occurred while fetching concepts.');
        }
    }

    // Function to fetch and display relationships
    async function fetchRelationships() {
        try {
            const response = await fetch('/concept-relationships'); // Need to create this GET endpoint
            const data = await response.json();
            if (data.success) {
                relationshipsList.innerHTML = ''; // Clear existing list
                if (data.relationships.length === 0) {
                    relationshipsList.innerHTML = '<li class="list-group-item text-muted">No relationships defined yet.</li>';
                    return;
                }
                data.relationships.forEach(rel => {
                    const sourceConcept = allConcepts.find(c => c.id === rel.source_concept_id);
                    const targetConcept = allConcepts.find(c => c.id === rel.target_concept_id);
                    const listItem = document.createElement('li');
                    listItem.className = 'list-group-item';
                    listItem.innerHTML = `
                        <div>
                            <strong>${sourceConcept ? sourceConcept.name : 'Unknown'}</strong> (ID: ${rel.source_concept_id})
                            <span class="badge bg-info text-dark">${rel.relationship_type}</span>
                            <strong>${targetConcept ? targetConcept.name : 'Unknown'}</strong> (ID: ${rel.target_concept_id})
                        </div>
                    `;
                    relationshipsList.appendChild(listItem);
                });
            } else {
                alert('Failed to fetch relationships: ' + data.message);
            }
        } catch (error) {
            console.error('Error fetching relationships:', error);
            alert('An error occurred while fetching relationships.');
        }
    }

    // Handle Add Concept Form Submission
    addConceptForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = conceptNameInput.value.trim();
        const description = conceptDescriptionInput.value.trim();

        try {
            const response = await fetch('/concepts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description })
            });
            const data = await response.json();
            if (data.success) {
                alert('Concept added successfully!');
                conceptNameInput.value = '';
                conceptDescriptionInput.value = '';
                fetchConcepts(); // Refresh list
            } else {
                alert('Failed to add concept: ' + data.message);
            }
        } catch (error) {
            console.error('Error adding concept:', error);
            alert('An error occurred while adding the concept.');
        }
    });

    // Handle Add Relationship Form Submission
    addRelationshipForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const source_concept_id = parseInt(sourceConceptSelect.value);
        const target_concept_id = parseInt(targetConceptSelect.value);

        if (!source_concept_id || !target_concept_id) {
            alert('Please select both source and target concepts.');
            return;
        }
        if (source_concept_id === target_concept_id) {
            alert('A concept cannot be a prerequisite for itself.');
            return;
        }

        try {
            const response = await fetch('/concept-relationships', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ source_concept_id, target_concept_id, relationship_type: 'DEPENDS_ON' })
            });
            const data = await response.json();
            if (data.success) {
                alert('Relationship added successfully!');
                fetchRelationships(); // Refresh list
            } else {
                alert('Failed to add relationship: ' + data.message);
            }
        } catch (error) {
            console.error('Error adding relationship:', error);
            alert('An error occurred while adding the relationship.');
        }
    });

    // Initial data load
    fetchConcepts();
    fetchRelationships(); // This will initially fail until the GET endpoint is added
});
const FilterPanel = (props) => {
    const {
        map,
        handlePuBoroughChange,
        handleDoBoroughChange,
        selectedPuZone,
        selectedDoZone,
        handlePuZoneChange,
        handleDoZoneChange,
        puZones,
        doZones,
    } = props;
// Create filter container
    const filterContainer = document.createElement('div');
    filterContainer.className = 'maplibregl-ctrl maplibregl-ctrl-group filter-container';

// Create pickup filters group
    const puFiltersGroup = document.createElement('div');
    puFiltersGroup.className = 'filters-group';

// Add pickup borough filter
    const puBoroughFilter = document.createElement('div');
    puBoroughFilter.className = 'borough-filter';
    puBoroughFilter.innerHTML = `
                <div class="borough-filter-title">From Borough</div>
                <select class="borough-select pu-borough-select">
                    <option value="All" selected>All Boroughs</option>
                    <option value="Manhattan">Manhattan</option>
                    <option value="Brooklyn">Brooklyn</option>
                    <option value="Queens">Queens</option>
                    <option value="Bronx">Bronx</option>
                    <option value="Staten Island">Staten Island</option>
                </select>
            `;

// Add pickup zone filter
    const puZoneFilter = document.createElement('div');
    puZoneFilter.className = 'zone-filter';
    puZoneFilter.innerHTML = `
                <div class="zone-filter-title">From Zone</div>
                <select class="zone-select pu-zone-select">
                    <option value="All" selected>All Zones</option>
                </select>
            `;

// Add them to the pickup filters group
    puFiltersGroup.appendChild(puBoroughFilter);
    puFiltersGroup.appendChild(puZoneFilter);

// Create destination filters group
    const doFiltersGroup = document.createElement('div');
    doFiltersGroup.className = 'filters-group';

// Add destination borough filter
    const doBoroughFilter = document.createElement('div');
    doBoroughFilter.className = 'borough-filter';
    doBoroughFilter.innerHTML = `
                <div class="borough-filter-title">To Borough</div>
                <select class="borough-select do-borough-select">
                    <option value="All">All Boroughs</option>
                    <option value="Manhattan" selected>Manhattan</option>
                    <option value="Brooklyn">Brooklyn</option>
                    <option value="Queens">Queens</option>
                    <option value="Bronx">Bronx</option>
                    <option value="Staten Island">Staten Island</option>
                </select>
            `;

// Add destination zone filter
    const doZoneFilter = document.createElement('div');
    doZoneFilter.className = 'zone-filter';
    doZoneFilter.innerHTML = `
                <div class="zone-filter-title">To Zone</div>
                <select class="zone-select do-zone-select">
                    <option value="All" selected>All Zones</option>
                </select>
            `;

// Add them to the destination filters group
    doFiltersGroup.appendChild(doBoroughFilter);
    doFiltersGroup.appendChild(doZoneFilter);

// Add a divider between groups
    const divider = document.createElement('div');
    divider.className = 'filter-divider';

// Add all filter components to the container
    filterContainer.appendChild(puFiltersGroup);
    filterContainer.appendChild(divider);
    filterContainer.appendChild(doFiltersGroup);

// Add event listeners for borough selection
    const puBoroughSelect = filterContainer.querySelector('.pu-borough-select');
    puBoroughSelect.addEventListener('change', (e) => {
        handlePuBoroughChange(e.target.value);
    });

    const doBoroughSelect = filterContainer.querySelector('.do-borough-select');
    doBoroughSelect.addEventListener('change', (e) => {
        handleDoBoroughChange(e.target.value);
    });

// Get the zone select elements
    const puZoneSelect = filterContainer.querySelector('.pu-zone-select');
    const doZoneSelect = filterContainer.querySelector('.do-zone-select');

// Add event listeners for zone selection
    puZoneSelect.addEventListener('change', (e) => {
        handlePuZoneChange(e.target.value);
    });

    doZoneSelect.addEventListener('change', (e) => {
        handleDoZoneChange(e.target.value);
    });

// Function to update zone options when zones change
    const updateZoneOptions = () => {
        // Update pickup zone options
        puZoneSelect.innerHTML = puZones.map(zone => `<option value="${zone.zone}" ${zone.zone === selectedPuZone ? 'selected' : ''}>${zone.zone}</option>`).join('');

        // Update destination zone options
        doZoneSelect.innerHTML = doZones.map(zone => `<option value="${zone.zone}" ${zone.zone === selectedDoZone ? 'selected' : ''}>${zone.zone}</option>`).join('');
    };

// Set up a mutation observer to watch for zone list changes
    const observer = new MutationObserver(() => {
        updateZoneOptions();
    });

// Initialize the zone lists and set up observers
    updateZoneOptions();

// Store the observer and select elements for cleanup
    filterContainer.observer = observer;
    filterContainer.puZoneSelect = puZoneSelect;
    filterContainer.doZoneSelect = doZoneSelect;
    return filterContainer;
}


export {FilterPanel};
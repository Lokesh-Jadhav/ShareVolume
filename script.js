async function fetchData(cik) {
    const response = await fetch(`https://data.sec.gov/api/xbrl/companyconcept/CIK${cik}/dei/EntityCommonStockSharesOutstanding.json`, {
        headers: {
            'User-Agent': 'Your Name (your.email@example.com)'
        }
    });
    const data = await response.json();
    return data;
}

function processShares(data) {
    const entityName = data.entityName;
    const shares = data.units.shares.filter(entry => entry.fy > "2020" && !isNaN(entry.val));
    
    if (shares.length === 0) {
        return { entityName, max: null, min: null };
    }

    const max = shares.reduce((prev, current) => (prev.val > current.val) ? prev : current);
    const min = shares.reduce((prev, current) => (prev.val < current.val) ? prev : current);

    return {
        entityName,
        max: { val: max.val, fy: max.fy },
        min: { val: min.val, fy: min.fy }
    };
}

function updateDOM(data) {
    document.getElementById('page-title').innerText = data.entityName;
    document.getElementById('share-entity-name').innerText = data.entityName;
    document.getElementById('share-max-value').innerText = data.max.val;
    document.getElementById('share-max-fy').innerText = data.max.fy;
    document.getElementById('share-min-value').innerText = data.min.val;
    document.getElementById('share-min-fy').innerText = data.min.fy;
}

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const cik = urlParams.get('CIK') || '0000004977'; // Default to Aflac CIK

    const data = await fetchData(cik);
    const processedData = processShares(data);
    updateDOM(processedData);
}

init();

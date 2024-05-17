document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const addItemForm = document.getElementById('addItemForm');
    const itemsList = document.getElementById('items');

    registerForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        fetch('api.php?action=register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `username=${username}&email=${email}&password=${password}`
        }).then(response => response.json()).then(data => {
            alert(data.message);
        });
    });

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        fetch('api.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `username=${username}&password=${password}`
        }).then(response => response.json()).then(data => {
            if (data.status === 'success') {
                localStorage.setItem('user_id', data.user_id);
                alert('Login successful!');
            } else {
                alert(data.message);
            }
        });
    });

    addItemForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const userId = localStorage.getItem('user_id');
        const itemName = document.getElementById('itemName').value;
        const itemDescription = document.getElementById('itemDescription').value;
        const itemCategory = document.getElementById('itemCategory').value;

        fetch('api.php?action=add_item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `user_id=${userId}&item_name=${itemName}&description=${itemDescription}&category=${itemCategory}`
        }).then(response => response.json()).then(data => {
            alert(data.message);
            loadItems();
        });
    });

    function loadItems() {
        fetch('api.php?action=get_items')
            .then(response => response.json())
            .then(data => {
                itemsList.innerHTML = '';
                data.items.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = `${item.item_name} (${item.category}): ${item.description}`;
                    itemsList.appendChild(li);
                });
            });
    }

    loadItems();
});

<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "DonationDB";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

header("Content-Type: application/json");

$action = $_GET['action'];

if ($action == 'register') {
    $username = $_POST['username'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $email = $_POST['email'];

    $sql = "INSERT INTO Users (username, password, email) VALUES ('$username', '$password', '$email')";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "User registered successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
} elseif ($action == 'login') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $sql = "SELECT * FROM Users WHERE username='$username'";
    $result = $conn->query($sql);
    $user = $result->fetch_assoc();

    if ($user && password_verify($password, $user['password'])) {
        echo json_encode(["status" => "success", "message" => "Login successful.", "user_id" => $user['user_id']]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid credentials."]);
    }
} elseif ($action == 'add_item') {
    $user_id = $_POST['user_id'];
    $item_name = $_POST['item_name'];
    $description = $_POST['description'];
    $category = $_POST['category'];

    $sql = "INSERT INTO Items (user_id, item_name, description, category) VALUES ('$user_id', '$item_name', '$description', '$category')";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Item added successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
} elseif ($action == 'get_items') {
    $sql = "SELECT * FROM Items";
    $result = $conn->query($sql);
    $items = [];

    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }

    echo json_encode(["status" => "success", "items" => $items]);
}

$conn->close();
?>

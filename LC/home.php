<?php
require_once("dbase.php");
session_start();

if (!isset($_SESSION["user_type"])) {
    header("HTTP/1.0 404 Not Found");
    die;
}

if (isset($_POST["submit"])) {
    $name = trim($_POST["name"]);
    $BX_NOOFBAGS = $_POST["BX_NOOFBAGS"];
    $BX_PRICE = $_POST["BX_PRICE"];
    $hamali = trim($_POST["txtHamali"]);
    $date = trim($_POST["billdate"]);
    $bagsSold = trim($_POST["bagsSold"]);
    $priceSold = trim($_POST["priceSold"]);
    $advance = trim($_POST["advance"]);

    if (billsConfirmed($conn, $date) == 0) {
        foreach ($BX_NOOFBAGS as $a => $b) {
            $noOfBags = trim($BX_NOOFBAGS[$a]);
            $price = trim($BX_PRICE[$a]);
            if ($a == 0) {
                $sql = "insert into inventory (name,no_of_bags,price,date,type,advance,hamali) values ('$name','$noOfBags','$price','$date','BUY','$advance','$hamali')";
            } else {
                $sql = "insert into inventory (name,no_of_bags,price,date,type,hamali) values ('$name','$noOfBags','$price','$date','BUY','$hamali')";
            }
            $conn->query($sql);
        }
        if ($bagsSold) {
            $sql1 = "insert into inventory (name,no_of_bags,price,date,type,paid,hamali) values ('$name','$bagsSold','$priceSold','$date','SELL','YES','$hamali')";
            if ($conn->query($sql1) === TRUE) {
                echo "<script>alert('saved successfully'); location.href='home';</script>\n";
            }
        } else {
            echo "<script>alert('saved successfully'); location.href='home';</script>\n";
        }
    } else {
        echo "<script>alert('Bills on that day are already finalized. You couldn't add new bill'); location.href='home';</script>\n";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
<title><?php echo $_SESSION["company"]; ?> - Home</title>
<script>
function getListExpenditures() {
    date = document.getElementById('txtdate').value;
    var obj = new XMLHttpRequest();
    obj.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("listExpDiv").innerHTML = this.responseText;
        }
    };
    obj.open("GET", "list_expenditures_copy.php?date=" + date, false);
    obj.send();
}

function getListCashCollection() {
    date = document.getElementById('ctxtdate').value;
    var obj = new XMLHttpRequest();
    obj.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("listCashCollectionDiv").innerHTML = this.responseText;
        }
    };
    obj.open("GET", "list_cash_collection.php?date=" + date, false);
    obj.send();
}

function getPrintBillScreen() {
    location.href = "printbillkisan";
}
</script>
<script>
window.onload = function() {
    document.getElementById('name').focus();
}

function addRowHome(tableID) {
    var table = document.getElementById(tableID);
    var rowCount = table.rows.length;
    if (rowCount < 10) {
        var row = table.insertRow(rowCount);
        var colCount = table.rows[0].cells.length;
        for (var i = 0; i < colCount; i++) {
            var newcell = row.insertCell(i);
            newcell.innerHTML = table.rows[0].cells[i].innerHTML;
        }
    } else {
        alert("Maximum channels 10 only");
    }
}

function deleteRowHome(tableID) {
    var table = document.getElementById(tableID);
    var rowCount = table.rows.length;
    for (var i = 0; i < rowCount; i++) {
        var row = table.rows[i];
        var chkbox = row.cells[0].childNodes[0];
        if (null != chkbox && true == chkbox.checked) {
            if (rowCount <= 1) {
                alert("Cannot Remove all the Passenger.");
                break;
            }
            table.deleteRow(i);
            rowCount--;
            i--;
        }
    }
}
</script>

<script type="text/javascript" src="main.js"></script>
<link rel="stylesheet" type="text/css" href="style.css">
<style>
form p {
    font-size: 8pt;
    clear: both;
    margin: 0;
    color: gray;
    padding: 4px;
}
.form td {
    border-right: 1px solid #F1F1F1;
    border-top: 1px solid #F1F1F1;
    border-bottom: 1px solid #F1F1F1;
    border-left: 0px solid #F1F1F1;
    padding: 2px;
    margin: 0;
}
</style>
</head>

<?php require_once("header.php"); ?>

<ul>
  <li><a href="home" class="active">Home</a></li>
  <li><a href="buyersDetails">Buyers Details</a></li>
  <li><a href="expenditures">Expenditures</a></li>
  <li><a href="cashCollection">Cash</a></li>
  <li><a href="bills">Bills</a></li>
  <li><a href="sms">SMS</a></li>
  <li><a href="advance">Advance</a></li>
  <li><a href="balancesheet">Balance Sheet</a></li>
  <li><a href="sell">Sold Data</a></li>
  <li><a href="beatpaper">Beat Paper</a></li>
  <li><a href="kisanbalance">kisan Balance</a></li>
  <?php if($_SESSION["user_type"] == "ADM") echo "<li><a href='sales'>Delhi</a></li>"; ?>
  <li><a href="notpaidbills">Not Paid Bills</a></li>
  <li><a href="paidBills">Paid Bills</a></li>
  <li><a href="shops">Shops</a></li>
  <li><a href="localSale">Local Sale</a></li>
</ul>

<body>
<form method="POST" action="<?php echo $_SERVER["PHP_SELF"]; ?>">
<br />
<table>
<tr>
<td width="50%" valign="top">
<table class="tab">
<tr>
<th align="center" colspan="2">Add Bill</th>
</tr>
<tr>
    <td>Date</td>
    <td><input type="date" name="billdate" id="billdate" value="<?php echo date("Y-m-d"); ?>" onkeydown="return false" required></td>
</tr>
<tr>
    <td>Kisan Name</td>
    <td><input type="text" name="name" id="name" value="" placeholder="Name" required></td>
</tr>

<tr><td colspan="2" align="left"><p>
  <a href="" onClick="addRowHome('dataTable'); return false;"> <font size="3">Click to add a Channel</font></a>
</p></td></tr>

<tr><td colspan="2">
<table id="dataTable" class="form" border="1">
 <tbody>
  <tr>
    <p>
    <td>&nbsp;</td>
    <td>
    <input type="text" name="BX_NOOFBAGS[]" id="bags" value="" placeholder="No. Of Bags" required>
    <input type="number" name="BX_PRICE[]" id="price" placeholder="Price per Bag" required>
    </td>
    </p>
  </tr>
 </tbody>
</table>
</td>
</tr>

<tr>
    <td>Hamali Per Bag</td>
    <td><input type="number" name="txtHamali" id="txtHamali" value="<?php echo $_SESSION["hamali"]; ?>" placeholder="Hamali Per Bag" pattern="[0-9]{1,10}" title="Enter valid number"></td>
</tr>
<tr>
    <td>Advance Given</td>
    <td><input type="number" name="advance" id="advance" value="" placeholder="Advance" pattern="[0-9]{1,10}" title="Enter valid number"></td>
</tr>
<tr>
    <td nowrap>No. Of Bags Sold Locally</td>
    <td><input type="number" name="bagsSold" id="bagsSold" value="" placeholder="No. Of Bags Sold" pattern="[0-9]{1,10}" title="Enter valid number"></td>
</tr>
<tr>
    <td>Price of Sold Bag</td>
    <td><input type="number" name="priceSold" id="priceSold" value="" placeholder="Price of Sold Bag" pattern="[0-9]{1,10}" title="Enter valid number"></td>
</tr>
<tr>
    <td></td>
    <td><input type="submit" class="btn" id="submit" name="submit" value="Submit"></td>
</tr>
</table>
</form>
</td>
<td width="10%" valign="top">&nbsp;</td>
<td width="30%" valign="top">
<td colspan="3"><image src="printbills.png" id="btnPrint" name="btnPrint" onclick="getPrintBillScreen()"></td>
</td>
</tr>
</table>
<br />
<table width="100%" class="tab">
<h2 align="center" style="color:green; background-color:white">- Bills On This Day -</h2>
<tr>
    <td colspan="3"><div id="div1"><?php require_once("billsView.php"); ?></div></td>
</tr>
</table>
</body>
</html>
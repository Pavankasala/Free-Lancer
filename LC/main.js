

function getAllBills(){
	
	var date= document.getElementById("bdate").value;
	
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
    document.getElementById("billdiv").innerHTML=this.responseText;
		}
	 }	 
	obj.open("POST","bills.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("date="+date);
		
}


function submitAmountToCounter()
{

	/*var r = document.getElementById('btnConfirmTotal').disabled;	
	if(r==false)
	{
		alert("Please Finalize bills by clicking Confirm and retry");
		return false;
	}*/
		
	var amount=document.getElementById("amountToCounter").value;
	if((isNaN(amount)==true))
	{
		alert("Please enter valid advance  amount");
		return false;
	}
	if(amount<0)
		amount = -1 * amount;
	var date=document.getElementById("bdate").value;
	if(amount==''){
	alert("Please Enter Amount");return false;}
	
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
	if(this.responseText=="success")
	{
		alert(amount+" given at counter successfully");
		location.reload();
	}
		}
	 }	 
	obj.open("POST","submitAmountAtCounter.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("date="+date+"&amountGiven="+amount);

	
}


function getListExpenditures()
{
	date=document.getElementById('txtdate').value;
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
    document.getElementById("listExpDiv").innerHTML=this.responseText;
		}
	 }	 
	obj.open("GET","list_expenditures_copy.php?date="+date, false);
	obj.send();
}

function getListExpendituresComplete()
{
	dateFrom=document.getElementById('txtdate1').value;
	dateTo=document.getElementById('txtdate2').value;
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
    document.getElementById("listExpComDiv").innerHTML=this.responseText;
		}
	 }	 
	obj.open("GET","list_expenditures_range.php?dateFrom="+dateFrom+"&dateTo="+dateTo, false);
	obj.send();
}

function getListCashCollection()
{
	date=document.getElementById('ctxtdate').value;
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
    document.getElementById("listCashCollectionDiv").innerHTML=this.responseText;
		}
	 }	 
	obj.open("GET","list_cash_collection.php?date="+date, false);
	obj.send();
	
}



function deleteBill(id)
{ 
		var r=confirm("Are You Sure Want To Delete?");
	if(r== false)
		return false;
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
	if(this.responseText=="success")
	{
		alert("deleted successfully");
		location.reload();
	}
		}
	 }	 
	obj.open("POST","deleteBill.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("billId="+id);
}

function confirmNetTotal()
{
	//alert("From confirmNetTotal");
	var r=confirm("Are You Sure Want To Finalize Net Total including expenditures?");
	if(r== false)
		return false;
	
	var date=document.getElementById("bdate").value;
	var tot=document.getElementById("netTotal").value;
	//var tot=netTotal+document.getElementById("shopsBills").value;
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
	if(this.responseText=="success")
	{
		alert("Finalized Successfully");
		location.reload();
	}
		}
	 }	 
	obj.open("POST","confirmNetTotal.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("date="+date+"&netTotal="+tot);
}


function getSmss(){
	
	var date= document.getElementById("sdate").value;
	
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
    document.getElementById("smsdiv").innerHTML=this.responseText;
		}
	 }	 
	obj.open("POST","listSms.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("date="+date);
		
}

function getFarmersList()
{
	var date=document.getElementById("billdate").value;
	if(date=="")
	{
		alert("Please select date");
		return false;
	}

	var obj =  new XMLHttpRequest();
	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
		   document.getElementById("farmersDiv").innerHTML=this.responseText;
		
		}
	 }
	 
	 
	obj.open("POST","getFarmersList.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("date="+date);
}

function getAdvance()
{
	var date=document.getElementById("billdate").value;
	var name=document.getElementById("selectbill").value;

	if (name=='Select Farmer')
	{
		alert("Please select farmer");
		return false;
	}
	
	var obj =  new XMLHttpRequest();
	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
		   document.getElementById("showAdvance").innerHTML=this.responseText;
		
		}
	 }
	 
	 
	obj.open("POST","getAdvance.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("name="+name+"&date="+date);
	
}

function submitAddAdvance(){

	var name=document.getElementById("selectbill").value;
	var date=document.getElementById("billdate").value;
	var presentAdvance=document.getElementById("txtAdvance").value
	
	if((isNaN(presentAdvance)==true)||(presentAdvance<0))
	{
		alert("Please enter valid advance  amount");
		return false;
	}
	
var obj =  new XMLHttpRequest();
	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
		
		if(this.responseText=="success")
		{
				alert("Advance added successfully");
				location.reload();
		}

		}
	 }
	 	 
	obj.open("POST","submitAddAdvance.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("name="+name+"&date="+date+"&presentAdvance="+presentAdvance);
}


function getAllBillsForPrint(){
	
	var date= document.getElementById("bdate").value;
	
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
    document.getElementById("billsdiv").innerHTML=this.responseText;
		}
	 }	 
	obj.open("POST","bills1.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("date="+date);
		
}


function printBillsForAdmin(billsDiv){
var bills=document.getElementById(billsDiv).innerHTML;
//alert("Press OK to print the bill");			
var html="<html>";
   html+= bills;

   html+="</html>";

   var printWin = window.open('','','left=0,top=0,width=1,height=1,toolbar=0,scrollbars=0,status  =0');
   printWin.document.write(html);
   printWin.document.close();
   printWin.focus();

   printWin.print();
   printWin.close();
   
   

}

function submitSoldPrice(id){
var soldPrice=document.getElementById("soldprice"+id).value;
var shortageBags=document.getElementById("shortageBags"+id).value;
var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
    alert(this.responseText);
		}
	 }	 
	obj.open("POST","submitSoldPrice.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("id="+id+"&soldPrice="+soldPrice+"&type=Nonlocal&shortageBags="+shortageBags);

}

function submitLocalSoldPrice(id){
var soldPrice=document.getElementById("lsoldprice"+id).value;
var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
    alert(this.responseText);
		}
	 }	 
	obj.open("POST","submitSoldPrice.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("id="+id+"&soldPrice="+soldPrice+"&type=Local");

}

function printBillKisan(id, name, date, paid)
{
	

	document.getElementById("pd-"+id).style.backgroundColor = "yellow";
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
	var popup = window.open("", "", "left=0,top=0,width=800,height=500,toolbar=1,scrollbars=1,status=0");
	  
	//popup.document.write('<html><head><title></title></head>');
    //popup.document.write('<body style="font-family:verdana; font-size:14px;width:110px;height:200px:" >');
     // table = document.getElementById("data");
	 popup.document.write(this.responseText);
//popup.document.write('</body></html>');


//document.getElementById('header').style.display = 'none';
//document.getElementById('footer').style.display = 'none';

          //  popup.document.close();
	 // popup.focus();
	  
	  
	
            //popup.print();
            //popup.close();
	/*popup.document.close();
	if (window.focus) 
		popup.focus();*/
		}
	 }	 
	obj.open("POST","printBillKisan.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("id="+id+"&name="+name+"&date="+date+"&paid="+paid);

}

function printKisanBillToPrinter(showbill, name, date){
	document.getElementById('btnPrint').disabled=true;
	var bill=document.getElementById(showbill).innerHTML;	
	var check="YES";
	//alert( "  sss "+ check + " ccccc "+ date + " dddddddd "+name);
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
		
		if(this.responseText=="updated success")
		{
				//alert("Press OK to print the bill");			
		}
		}
	 }	 
	 
	obj.open("POST","paid.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("name="+name+"&date="+date+"&check="+check+"&type='KISAN'");
		
	var divToPrint = document.getElementById('showbill');
       var popupWin = window.open('', '_blank', 'width=400,height=600');
       //popupWin.document.open();
       popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="global.css"  /></head><body onload="window.print()">' + divToPrint.innerHTML + '</html>');
        popupWin.document.close();

}

function getSoldData()
{
	var name=document.getElementById("txtSellName").value;
	var year=document.getElementById("year").value; //alert(year);
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
    document.getElementById('soldDataDiv').innerHTML=this.responseText;
		}
	 }	 
	obj.open("POST","getSoldData.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("name="+name+"&year="+year);
}


function deleteExp(id)
{ 
		var r=confirm("Are You Sure Want To Delete?");
	if(r== false)
		return false;
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
	if(this.responseText=="success")
	{
		alert("deleted successfully");
		location.reload();
	}
		}
	 }	 
	obj.open("POST","deleteExp.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("id="+id);
}

function deleteCashCollection(id)
{ 
		var r=confirm("Are You Sure Want To Delete?");
	if(r== false)
		return false;
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
	if(this.responseText=="success")
	{
		alert("deleted successfully");
		location.reload();
	}
		}
	 }	 
	obj.open("POST","deleteCashCollection.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("id="+id);
}


function deleteSoldData(id)
{ 
		var r=confirm("Are You Sure Want To Delete?");
	if(r== false)
		return false;
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
	if(this.responseText=="success")
	{
		alert("deleted successfully");
		location.reload();
	}
		}
	 }	 
	obj.open("POST","deleteSoldData.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("id="+id);
}


function deleteShopBills(id)
{ 
		var r=confirm("Are You Sure Want To Delete?");
	if(r== false)
		return false;
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
	if(this.responseText=="success")
	{
		alert("deleted successfully");
		location.reload();
	}
		}
	 }	 
	obj.open("POST","deleteShopBills.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("id="+id);
}



function deleteSale(id)
{ 
		var r=confirm("Are You Sure Want To Delete?");
	if(r== false)
		return false;
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
	if(this.responseText=="success")
	{
		alert("deleted successfully");
		location.reload();
	}
		}
	 }	 
	obj.open("POST","deleteSale.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("saleId="+id);
}



function printBillLocalSale(id, name, date, paid)
{
	

	document.getElementById("pd-"+id).style.backgroundColor = "yellow";
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
	var popup = window.open("", "", "left=0,top=0,width=800,height=500,toolbar=1,scrollbars=1,status=0");
	  
	//popup.document.write('<html><head><title></title></head>');
    //popup.document.write('<body style="font-family:verdana; font-size:14px;width:110px;height:200px:" >');
     // table = document.getElementById("data");
	 popup.document.write(this.responseText);
//popup.document.write('</body></html>');


//document.getElementById('header').style.display = 'none';
//document.getElementById('footer').style.display = 'none';

          //  popup.document.close();
	 // popup.focus();
	  
	  
	
            //popup.print();
            //popup.close();
	/*popup.document.close();
	if (window.focus) 
		popup.focus();*/
		}
	 }	 
	obj.open("POST","printBillLocalSale.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("id="+id+"&name="+name+"&date="+date+"&paid="+paid);

}

function printLocalSaleBillToPrinter(showbill, name, date){
	document.getElementById('btnPrint').disabled=true;
	var bill=document.getElementById(showbill).innerHTML;	
	var check="YES";
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
		
		if(this.responseText=="updated success")
		{
				//alert("Press OK to print the bill");			
		}
		}
	 }	 
	 
	obj.open("POST","paid.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("name="+name+"&date="+date+"&check="+check+"&type=LOCAL");
		
	var divToPrint = document.getElementById('showbill');
       var popupWin = window.open('', '_blank', 'width=400,height=600');
       //popupWin.document.open();
       popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="global.css"  /></head><body onload="window.print()">' + divToPrint.innerHTML + '</html>');
        popupWin.document.close();

}




var divPrintDiv;
function closedetails()
{
	if(divPrintDiv) {
	divRewDet.style.display='none';
	}
}  




function getTopPos(inputObj)
{
  var returnValue = inputObj.offsetTop + inputObj.offsetHeight;
  while((inputObj = inputObj.offsetParent) != null)returnValue += inputObj.offsetTop;
  return returnValue;
}

function getleftPos(inputObj)
{
  var returnValue = inputObj.offsetLeft;
  while((inputObj = inputObj.offsetParent) != null)returnValue += inputObj.offsetLeft;
  return returnValue;
}

function printBillKisan1(id, name, date, paid, inputObj)
{
	var obj =  new XMLHttpRequest();	
	obj.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
divRewDet = document.createElement("crDiv");
divRewDet.style.left = getleftPos(inputObj)-100+ 'px';
divRewDet.style.top = getTopPos(inputObj)-100 + 'px';
divRewDet.id = "showbill";
divRewDet.style.margin = "0px auto";
divRewDet.className ="dynamicDiv";
divRewDet.innerHTML =this.responseText;
document.body.appendChild(divRewDet);

	/*popup.document.write(this.responseText);
	popup.document.close();
	if (window.focus) 
		popup.focus();*/
		}
	 }	 
	obj.open("POST","printBillKisan.php", false);
	obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	obj.send("id="+id+"&name="+name+"&date="+date+"&paid="+paid);

}

const popupBg = document.getElementById("popup-bg");
const detailsPopupBtn = document.getElementsByClassName("details-popup-btn");
const detailsPopup = document.getElementById("editing-popup-slippage");
const tokenPopup = document.getElementById("token-popup");
const currencyBox = document.getElementById("currency-box");
const arrowImg = document.getElementById("arrow-img");

const usdtPaid = document.getElementById("usdt-paid");
const blthPaid = document.getElementById("blth-paid");

const handleOpenDetailsPopup = () => {
  detailsPopup.style.display = "flex";
  popupBg.style.display = "unset";
};
const handleCloseDetailsPopup = () => {
  detailsPopup.style.display = "none";
  popupBg.style.display = "none";
};

const handleOpenTokenPopup = () => {
  popupBg.style.display = "flex";
  tokenPopup.style.display = "flex";
};

const handleCloseTokenPopup = () => {
  popupBg.style.display = "none";
  tokenPopup.style.display = "none";
};

let swapped = false;

const swap = () => {
  if (currencyBox.style.order === "2") {
    currencyBox.style.order = "unset";
    arrowImg.style.transform = "unset";
    usdtPaid.innerText = "yOU SEND*:";
    blthPaid.innerText = "TOTAL AVAILABLE FOR YOU:";
  } else {
    currencyBox.style.order = "2";
    arrowImg.style.transform = "rotate(180deg)";
    blthPaid.innerText = "yOU SEND*:";
    usdtPaid.innerText = "yOU RECEIVE:";
  }
};

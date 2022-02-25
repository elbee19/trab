//https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

function updateBlockButtonIcon(blockButton) {
  let firstDivChild = blockButton.children("div:first-child");
  firstDivChild.attr("data-testid", "block");
  firstDivChild.attr("aria-label", "Block");
  blockButton.find("svg").parent().html(
    // Bootstrap Dash circle
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash-circle" viewBox="0 0 16 16"> <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/> <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/> </svg>'
  );
}

//https://stackoverflow.com/questions/43613261/javascript-create-and-destroy-a-toast-message
function CreateToast(toastMessage) {
  let toastDivContainer = document.createElement("div");
  toastDivContainer.className = "one-click-block-report-toast-container";

  let toastDiv = document.createElement("div");
  toastDiv.className = "one-click-block-report-toast";

  toastDiv.innerHTML = toastMessage;

  toastDivContainer.appendChild(toastDiv);
  document.body.appendChild(toastDivContainer);
}

function addBlockAndReportButton(article) {
  let shareButton = article.find('div[role="group"] div:nth-child(4)');
  if (!shareButton.length) {
    // blocked
    return;
  }

  shareButton.after(shareButton.clone());
  let blockButton = shareButton.next();
  updateBlockButtonIcon(blockButton);

  blockButton.click(function (event) {
    var hideMenuTemporarily = true;
    var hideDialogTemporarily = true;
    CreateToast("Reporting tweet and blocking user...");

    let more = $(event.target)
      .closest("article")
      .find("div[aria-label='More']");
    more.click();

    waitForElm("div[role='menu']").then((menu) => {
      if (hideMenuTemporarily) {
        $(menu).hide();
        hideMenuTemporarily = false;
      }
    });

    waitForElm("div[data-testid='report']").then((report) => {
      report.click();
      waitForElm("div[role='dialog']").then((dialog) => {
        if (hideDialogTemporarily) {
          $(dialog).hide();
          hideDialogTemporarily = false;
        }
      });

      waitForElm("div[role='dialog'] iframe").then((ifr) => {
        $("div[role='dialog'] iframe").on("load", function () {
          // This block is run each time the frame changes
          // however, not all elements are always present
          let ifrm = $("div[role='dialog'] iframe");
          let spamButton = ifrm.contents().find("button[id='spam-btn']");
          let spamCatchAllButton = ifrm
            .contents()
            .find("button[id='spam-catchall-btn']");
          let blockButton = ifrm.contents().find("button[id='block-btn']");
          let closeButton = $("div[aria-label='Close']");
          if (spamButton.length) {
            spamButton.click();
          } else if (spamCatchAllButton.length) {
            spamCatchAllButton.click();
          } else if (blockButton.length) {
            blockButton.click();
          } else {
            closeButton.click();
            //https://stackoverflow.com/questions/43613261/javascript-create-and-destroy-a-toast-message
            $(document)
              .find(".one-click-block-report-toast-container")
              .fadeOut(200, function () {
                $(this).remove();
              });
          }
        });
      });
    });
  });
}

$(function () {
  $(document).on("DOMNodeInserted", (event) => {
    let articles = $(event.target).find("article");
    articles.each((k, value) => {
      if ($(value).find("span:contains('You reported this Tweet')").length) {
        //article with blocked tweet
        //continue
      } else {
        addBlockAndReportButton($(value));
      }
    });
  });
});

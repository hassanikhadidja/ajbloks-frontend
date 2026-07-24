(function () {
  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(String(reader.result || ""));
      };
      reader.onerror = function () {
        reject(new Error("Lecture du fichier impossible"));
      };
      reader.readAsDataURL(file);
    });
  }

  async function readFilesAsDataUrls(fileList, maxFiles) {
    var files = Array.prototype.slice.call(fileList || [], 0, maxFiles || 5);
    var out = [];
    for (var i = 0; i < files.length; i++) {
      if (!files[i] || !files[i].type || files[i].type.indexOf("image/") !== 0) continue;
      out.push(await readFileAsDataUrl(files[i]));
    }
    return out;
  }

  async function submitReturnRequest(payload) {
    if (!window.AJBApi || typeof window.AJBApi.post !== "function") {
      throw new Error("Service indisponible. Réessayez dans un instant.");
    }
    return window.AJBApi.post("/return-request", payload);
  }

  window.AJBReturnRequest = {
    readFilesAsDataUrls: readFilesAsDataUrls,
    submit: submitReturnRequest,
  };
})();

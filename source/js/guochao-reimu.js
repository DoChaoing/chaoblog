(function () {
  "use strict";

  var verses = [
    "以代码为符，向智能世界问道。",
    "山海有尽，求知无涯。",
    "让每一次实验，都成为下一次跃迁的起点。",
    "模型是舟，工程是桨，问题才是远方。"
  ];

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function mountProgress() {
    if (document.getElementById("chao-progress")) return;
    var progress = document.createElement("div");
    progress.id = "chao-progress";
    document.body.appendChild(progress);

    var update = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progress.style.width = (ratio * 100).toFixed(2) + "%";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function mountToast() {
    var toast = document.createElement("div");
    toast.className = "chao-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.innerHTML = "<strong>今日灵感</strong><span></span>";
    document.body.appendChild(toast);
    return toast;
  }

  function bindLogoSpark() {
    var logo = document.querySelector("#logo");
    if (!logo || logo.dataset.chaoBound) return;
    logo.dataset.chaoBound = "true";
    var toast = mountToast();
    var timer;

    logo.addEventListener("click", function () {
      toast.querySelector("span").textContent = verses[Math.floor(Math.random() * verses.length)];
      toast.classList.add("is-visible");
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        toast.classList.remove("is-visible");
      }, 3600);
    });
  }

  function swapPageBanner() {
    var banners = {
      "/archives": "/images/dao-archive.png",
      "/categories": "/images/dao-categories.png",
      "/tags": "/images/dao-tags.png",
      "/ai-learning": "/images/dao-learning.png",
      "/about.html": "/images/dao-about.png",
      "/friends.html": "/images/dao-friends.png"
    };
    var path = window.location.pathname.replace(/\/$/, "") || "/";
    var banner = banners[path];
    var image = document.querySelector("#header > img");
    if (!banner || !image || image.getAttribute("src") === banner) return;

    image.setAttribute("src", banner);
    image.removeAttribute("srcset");
  }

  ready(function () {
    swapPageBanner();
    mountProgress();
    bindLogoSpark();
  });
})();

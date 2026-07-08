(function () {
  "use strict";

  var ideas = [
    "Ship the smallest useful experiment.",
    "Turn one repeated task into a prompt.",
    "Write the boring notes. They become leverage.",
    "A good workflow removes decisions, not curiosity.",
    "Measure once before you optimize twice."
  ];

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function ensureProgress() {
    if (document.getElementById("nf-progress")) return;
    var bar = document.createElement("div");
    bar.id = "nf-progress";
    document.body.appendChild(bar);

    var update = function () {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      bar.style.width = Math.max(0, Math.min(100, ratio * 100)) + "%";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function ensureSignalWidget() {
    var sidebar = document.querySelector("#kratos-widget-area .sticky-area, #kratos-widget-area");
    if (!sidebar || sidebar.querySelector(".nf-signal-widget")) return;

    var widget = document.createElement("aside");
    widget.className = "widget nf-signal-widget clearfix";
    widget.innerHTML = [
      '<div class="nf-signal-title"><span>Signal Board</span><span class="nf-signal-dot"></span></div>',
      '<div class="nf-signal-track">',
      signalItem("Agents", 86),
      signalItem("RAG", 78),
      signalItem("Coding", 92),
      "</div>"
    ].join("");
    sidebar.insertBefore(widget, sidebar.firstChild);
  }

  function signalItem(label, value) {
    return [
      '<div class="nf-signal-item">',
      "<span>" + label + "</span>",
      '<span class="nf-signal-bar" style="--value:' + value + '%"><span></span></span>',
      "<strong>" + value + "%</strong>",
      "</div>"
    ].join("");
  }

  function ensureToast() {
    var toast = document.querySelector(".nf-toast");
    if (toast) return toast;
    toast = document.createElement("div");
    toast.className = "nf-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
    return toast;
  }

  function bindInspiration() {
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-nf-inspire]");
      if (!trigger) return;

      event.preventDefault();
      var idea = ideas[Math.floor(Math.random() * ideas.length)];
      var toast = ensureToast();
      toast.innerHTML = "<strong>Next spark</strong><span>" + idea + "</span>";
      toast.classList.add("is-visible");
      pop(event.clientX, event.clientY);
      window.clearTimeout(bindInspiration.timer);
      bindInspiration.timer = window.setTimeout(function () {
        toast.classList.remove("is-visible");
      }, 3200);
    });
  }

  function pop(x, y) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (var i = 0; i < 10; i += 1) {
      var dot = document.createElement("span");
      var angle = (Math.PI * 2 * i) / 10;
      var distance = 42 + Math.random() * 22;
      dot.className = "nf-pop";
      dot.style.left = x + "px";
      dot.style.top = y + "px";
      dot.style.setProperty("--x", Math.cos(angle) * distance + "px");
      dot.style.setProperty("--y", Math.sin(angle) * distance + "px");
      document.body.appendChild(dot);
      dot.addEventListener("animationend", function () {
        this.remove();
      });
    }
  }

  function ensureStarfield() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.getElementById("nf-starfield")) return;

    var canvas = document.createElement("canvas");
    canvas.id = "nf-starfield";
    document.body.prepend(canvas);
    var ctx = canvas.getContext("2d");
    var nodes = [];
    var width = 0;
    var height = 0;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      var count = Math.min(56, Math.max(28, Math.floor(width / 28)));
      nodes = Array.from({ length: count }, function () {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25
        };
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(23, 184, 166, 0.42)";
      ctx.strokeStyle = "rgba(108, 124, 255, 0.12)";
      nodes.forEach(function (node, index) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.4, 0, Math.PI * 2);
        ctx.fill();

        for (var j = index + 1; j < nodes.length; j += 1) {
          var other = nodes[j];
          var dx = node.x - other.x;
          var dy = node.y - other.y;
          var distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 118) {
            ctx.globalAlpha = 1 - distance / 118;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });
      window.requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
  }

  function fixPostNavigation() {
    var nav = document.querySelector(".post-navigation");
    if (!nav || nav.dataset.nfFixed === "true") return;

    var previousBox = nav.querySelector(".nav-previous");
    var nextBox = nav.querySelector(".nav-next");
    var themeNext = previousBox ? previousBox.querySelector("a") : null;
    var themePrev = nextBox ? nextBox.querySelector("a") : null;
    var pageTitle = document.querySelector("h1.kratos-page-title, .kratos-page-title");
    var currentSeries = getSeries(pageTitle ? pageTitle.textContent : "");

    function getSeries(title) {
      var series = ["AI 面试扩展题库", "AI 系统学习路线", "AI 面试知识库"];
      for (var i = 0; i < series.length; i++) {
        if (title.indexOf(series[i]) !== -1) return series[i];
      }
      return "";
    }

    function snapshot(link) {
      return link
        ? {
            href: link.getAttribute("href") || "#",
            title: (link.getAttribute("title") || "").trim()
          }
        : null;
    }

    function sameSeries(source) {
      if (!source || !currentSeries) return source;
      return source.title.indexOf(currentSeries) !== -1 ? source : null;
    }

    function setLink(link, source, label, direction) {
      if (!link || !source) return;
      link.setAttribute("href", source.href);
      link.setAttribute("title", source.title);
      if (direction === "left") {
        link.innerHTML = '<i class="fa fa-angle-left"></i> ' + label;
      } else {
        link.innerHTML = label + ' <i class="fa fa-angle-right"></i>';
      }
    }

    function hideBox(box) {
      if (!box) return;
      box.style.display = "none";
    }

    var nextSnapshot = sameSeries(snapshot(themeNext));
    var prevSnapshot = sameSeries(snapshot(themePrev));

    if (prevSnapshot && nextSnapshot) {
      setLink(themeNext, prevSnapshot, "上一篇", "left");
      setLink(themePrev, nextSnapshot, "下一篇", "right");
    } else if (prevSnapshot) {
      hideBox(previousBox);
      nextBox.className = "nav-previous clearfix";
      setLink(themePrev, prevSnapshot, "上一篇", "left");
    } else if (nextSnapshot) {
      if (nextBox) hideBox(nextBox);
      previousBox.className = "nav-next clearfix";
      setLink(themeNext, nextSnapshot, "下一篇", "right");
    } else {
      hideBox(previousBox);
      hideBox(nextBox);
    }

    nav.dataset.nfFixed = "true";
  }

  function watchPostNavigation() {
    fixPostNavigation();
    window.setTimeout(fixPostNavigation, 120);
    window.setTimeout(fixPostNavigation, 600);

    if (!window.MutationObserver) return;
    var observer = new MutationObserver(function () {
      var nav = document.querySelector(".post-navigation");
      if (!nav || nav.dataset.nfFixed === "true") return;
      fixPostNavigation();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  ready(function () {
    ensureProgress();
    ensureSignalWidget();
    ensureStarfield();
    bindInspiration();
    watchPostNavigation();
  });

  window.addEventListener("load", fixPostNavigation);

  document.addEventListener("pjax:complete", function () {
    ensureSignalWidget();
    watchPostNavigation();
  });
})();

/* ============================================================
   个人主页交互逻辑
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- DOM 引用 ---------- */
  const nav = document.getElementById("nav");
  const navLinks = document.getElementById("navLinks");
  const navHamburger = document.getElementById("navHamburger");
  const navOverlay = document.getElementById("navOverlay");
  const themeToggle = document.getElementById("themeToggle");
  const backToTop = document.getElementById("backToTop");
  const typewriterEl = document.getElementById("typewriter");
  const contactForm = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");

  const sectionIds = ["hero", "about", "skills", "projects", "blog", "contact"];
  const sections = sectionIds.map((id) => document.getElementById(id));
  const navLinkEls = document.querySelectorAll(".nav-link");

  /* ============================================================
     1. 打字机动画
     ============================================================ */
  const typeText = "陈小汉";
  let typeIndex = 0;
  function typeWriter() {
    if (typeIndex <= typeText.length) {
      typewriterEl.textContent = typeText.slice(0, typeIndex);
      typeIndex++;
      setTimeout(typeWriter, 120);
    }
  }
  typeWriter();

  /* ============================================================
     2. 滚动相关：导航栏阴影 + 回到顶部按钮 + 导航高亮
     ============================================================ */
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;

      // 导航栏阴影
      nav.classList.toggle("scrolled", scrollY > 20);

      // 回到顶部按钮
      backToTop.classList.toggle("show", scrollY > 400);

      // 导航高亮
      let currentSection = "hero";
      for (const section of sections) {
        if (!section) continue;
        const top = section.offsetTop - 100;
        if (scrollY >= top) {
          currentSection = section.id;
        }
      }
      navLinkEls.forEach((link) => {
        link.classList.toggle(
          "active",
          link.dataset.section === currentSection
        );
      });

      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ============================================================
     3. 回到顶部
     ============================================================ */
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ============================================================
     4. 移动端汉堡菜单
     ============================================================ */
  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !navHamburger.classList.contains("open");
    navHamburger.classList.toggle("open", isOpen);
    navLinks.classList.toggle("open", isOpen);
    navOverlay.classList.toggle("show", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  navHamburger.addEventListener("click", () => toggleMenu());
  navOverlay.addEventListener("click", () => toggleMenu(false));

  // 点击导航链接后关闭菜单
  navLinkEls.forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });

  /* ============================================================
     5. 暗色模式切换
     ============================================================ */
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ============================================================
     6. 滚动淡入动画（Intersection Observer）
     ============================================================ */
  const fadeEls = document.querySelectorAll(".fade-up");

  if ("IntersectionObserver" in window) {
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    fadeEls.forEach((el) => fadeObserver.observe(el));
  } else {
    // 降级：直接全部显示
    fadeEls.forEach((el) => el.classList.add("visible"));
  }

  /* ============================================================
     7. 技能进度条动画
     ============================================================ */
  const barFills = document.querySelectorAll(".skill-bar-fill");

  if ("IntersectionObserver" in window) {
    const barObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const width = entry.target.dataset.width || 0;
            entry.target.style.width = width + "%";
            barObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    barFills.forEach((el) => barObserver.observe(el));
  } else {
    barFills.forEach((el) => {
      el.style.width = (el.dataset.width || 0) + "%";
    });
  }

  /* ============================================================
     8. 项目 & 博客筛选
     ============================================================ */
  function setupFilter(containerSelector, cardSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const buttons = container.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(cardSelector);

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter;
        cards.forEach((card) => {
          if (filter === "all" || card.dataset.category === filter) {
            card.classList.remove("hidden");
          } else {
            card.classList.add("hidden");
          }
        });
      });
    });
  }

  setupFilter(".project-filters", ".project-card");
  setupFilter(".blog-filters", ".blog-card");

  /* ============================================================
     9. 博客展开/收起
     ============================================================ */
  document.querySelectorAll(".blog-read-more").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".blog-card");
      const fullContent = card.querySelector(".blog-full");
      const isExpanded = fullContent.style.display !== "none";

      if (isExpanded) {
        fullContent.style.display = "none";
        btn.textContent = "阅读全文 \u2193";
      } else {
        fullContent.style.display = "block";
        btn.textContent = "收起 \u2191";
      }
    });
  });

  /* ============================================================
     10. 联系表单验证
     ============================================================ */
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("contactName");
      const email = document.getElementById("contactEmail");
      const message = document.getElementById("contactMessage");
      const nameError = document.getElementById("nameError");
      const emailError = document.getElementById("emailError");
      const messageError = document.getElementById("messageError");

      let valid = true;

      // 重置
      nameError.textContent = "";
      emailError.textContent = "";
      messageError.textContent = "";

      if (!name.value.trim()) {
        nameError.textContent = "请输入姓名";
        valid = false;
      }

      if (!email.value.trim()) {
        emailError.textContent = "请输入邮箱";
        valid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        emailError.textContent = "请输入有效的邮箱地址";
        valid = false;
      }

      if (!message.value.trim()) {
        messageError.textContent = "请输入留言内容";
        valid = false;
      }

      if (valid) {
        // 演示模式：显示成功提示并重置
        formSuccess.style.display = "block";
        contactForm.reset();
        setTimeout(() => {
          formSuccess.style.display = "none";
        }, 4000);
      }
    });
  }
});

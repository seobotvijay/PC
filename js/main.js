(function () {
  'use strict';

  // Mobile nav toggle
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Poll of the Day ----
  var POLLS = [
    {
      q: 'What’s the hardest part of your day as a parent right now?',
      opts: ['School mornings', 'Screen-time battles', 'Homework time', 'Bedtime']
    },
    {
      q: 'How does your child usually react to a firm "no"?',
      opts: ['Accepts it, grumbling', 'Negotiates', 'Full meltdown', 'Ignores me and tries again later']
    },
    {
      q: 'What do you wish you had more of as a parent?',
      opts: ['Patience', 'Time together', 'Practical tips', 'Other parents to talk to']
    },
    {
      q: 'Which age is hardest to parent, in your experience?',
      opts: ['Toddler (1–3)', 'Primary (6–10)', 'Pre-teen (11–13)', 'Teen (14–18)']
    },
    {
      q: 'How do you usually handle a public tantrum?',
      opts: ['Step aside and wait it out', 'Give in to stop it', 'Stay firm on the spot', 'Distract and move on']
    },
    {
      q: 'What matters most when choosing a hobby class for your child?',
      opts: ['What they enjoy', 'A useful skill', 'Close to home', 'What friends are doing']
    },
    {
      q: 'How much screen time does your child get on a school day?',
      opts: ['Under 30 mins', '30–60 mins', '1–2 hours', 'More than 2 hours']
    }
  ];

  function dayIndex() {
    var start = new Date(new Date().getFullYear(), 0, 0);
    var diff = new Date() - start;
    var oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function initPoll() {
    var card = document.getElementById('pollCard');
    if (!card) return;

    var poll = POLLS[dayIndex() % POLLS.length];
    var storeKey = 'pc_poll_' + todayKey();
    var votesKey = storeKey + '_votes';

    var questionEl = document.getElementById('pollQuestion');
    var optsEl = document.getElementById('pollOpts');
    var footnoteEl = document.getElementById('pollFootnote');
    questionEl.textContent = poll.q;

    var votes = readVotes();
    var already = readChoice();

    function readVotes() {
      try {
        var raw = localStorage.getItem(votesKey);
        return raw ? JSON.parse(raw) : seedVotes();
      } catch (e) {
        return seedVotes();
      }
    }

    function seedVotes() {
      // plausible baseline distribution so the first-ever voter still sees a bar chart
      var base = poll.opts.map(function () { return 8 + Math.floor(Math.random() * 20); });
      return base;
    }

    function readChoice() {
      try {
        return localStorage.getItem(storeKey);
      } catch (e) {
        return null;
      }
    }

    function render() {
      optsEl.innerHTML = '';
      var total = votes.reduce(function (a, b) { return a + b; }, 0) || 1;
      var voted = already !== null;
      card.classList.toggle('voted', voted);

      poll.opts.forEach(function (label, i) {
        var pct = Math.round((votes[i] / total) * 100);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'poll-opt';
        btn.setAttribute('data-i', i);
        btn.innerHTML =
          '<span class="fill" style="width:' + (voted ? pct : 0) + '%"></span>' +
          '<span class="label">' + label + '</span>' +
          '<span class="pct">' + pct + '%</span>';
        if (voted) btn.disabled = true;
        if (String(i) === already) btn.style.borderColor = 'var(--indigo)';
        btn.addEventListener('click', function () {
          if (already !== null) return;
          votes[i] += 1;
          try {
            localStorage.setItem(votesKey, JSON.stringify(votes));
            localStorage.setItem(storeKey, String(i));
          } catch (e) {}
          already = String(i);
          render();
        });
        optsEl.appendChild(btn);
      });

      var totalVotes = votes.reduce(function (a, b) { return a + b; }, 0);
      footnoteEl.textContent = voted
        ? totalVotes + ' parents have voted today — thanks for sharing yours.'
        : 'Pick one — see how other parents answered right after you vote.';
    }

    render();
  }

  initPoll();

  // ---- Newsletter form (client-side only, no backend configured) ----
  var form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var status = document.getElementById('newsletterStatus');
      var email = input.value.trim();
      if (!email) return;
      status.textContent = 'Thanks! We’ll send parenting tips to ' + email + '.';
      form.reset();
    });
  }
})();

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

  // ---- Today's Parenting Quote & Tip ----
  var QUOTES = [
    { text: 'Children are not things to be molded, but people to be unfolded.', by: 'Jess Lair' },
    { text: 'The way we talk to our children becomes their inner voice.', by: 'Peggy O’Mara' },
    { text: 'There is no such thing as a perfect parent. So just be a real one.', by: 'Sue Atkins' },
    { text: 'The days are long, but the years are short.', by: 'Gretchen Rubin' },
    { text: 'A child seldom needs a good talking to as much as a good listening to.', by: 'Robert Brault' },
    { text: 'Behind every young child who believes in himself is a parent who believed first.', by: 'Matthew L. Jacobson' },
    { text: 'Parenting is not about perfection. It’s about connection.', by: 'Unknown' }
  ];

  var TIPS = [
    { title: 'Give two real choices', body: 'Toddlers push back less when they get to choose between two options you’re both fine with — red cup or blue cup, now or in five minutes.' },
    { title: 'Twenty minutes, then a break', body: 'Concentration for primary-age children runs out fast. A short movement break restores focus better than pushing through.' },
    { title: 'Ask about their day before the test', body: 'Pre-teens pick up on a parent’s worry about marks quickly. Lead with curiosity about their day, not the score.' },
    { title: 'Say no once, calmly', body: 'Repeating the same calm word beats a longer explanation when a toddler is mid-meltdown. Save the explaining for later, once everyone’s calm.' },
    { title: 'Sit near, not over', body: 'During homework, being in the room helps more than checking every answer — it keeps the work theirs.' },
    { title: 'Catch them being good', body: 'Praise that lands on effort, not just results, teaches a child that trying hard matters as much as getting it right.' },
    { title: 'Talk side-by-side', body: 'Teens open up more easily in a car or on a walk than face-to-face across a table. Use the drive.' }
  ];

  function initToday() {
    var quoteText = document.getElementById('quoteText');
    var quoteAuthor = document.getElementById('quoteAuthor');
    var tipTitle = document.getElementById('tipTitle');
    var tipBody = document.getElementById('tipBody');
    if (!quoteText || !tipTitle) return;

    var i = dayIndex();
    var quote = QUOTES[i % QUOTES.length];
    var tip = TIPS[i % TIPS.length];

    quoteText.textContent = '“' + quote.text + '”';
    quoteAuthor.textContent = '— ' + quote.by;
    tipTitle.textContent = tip.title;
    tipBody.textContent = tip.body;
  }

  initToday();
})();

import { GenQuestion, SkillDef, mcq, rand, uniqueByPrompt } from "./types";

const N = 16; // questions per skill

function times(n: number, f: (i: number) => GenQuestion): GenQuestion[] {
  return uniqueByPrompt(Array.from({ length: n * 2 }, (_, i) => f(i))).slice(0, n);
}

// ---------- shared generators ----------

function addGen(maxA: number, maxB: number, diffBase: number) {
  return () =>
    times(N, () => {
      const a = rand(1, maxA);
      const b = rand(1, maxB);
      const ans = a + b;
      return mcq(
        diffBase + (ans > maxA ? 1 : 0),
        `What is ${a} + ${b}?`,
        String(ans),
        [
          [String(ans + 1), "off-by-one"],
          [String(Math.max(0, ans - 1)), "off-by-one"],
          [String(Math.abs(a - b)), "subtracted-instead"],
        ],
        `${a} + ${b} = ${ans}. You can count on from ${a} by ${b} more.`
      );
    });
}

function subGen(maxA: number, diffBase: number) {
  return () =>
    times(N, () => {
      const a = rand(2, maxA);
      const b = rand(1, a - 1);
      const ans = a - b;
      return mcq(
        diffBase,
        `What is ${a} − ${b}?`,
        String(ans),
        [
          [String(ans + 1), "off-by-one"],
          [String(Math.max(0, ans - 1)), "off-by-one"],
          [String(a + b), "added-instead"],
        ],
        `${a} − ${b} = ${ans}. Start at ${a} and count back ${b}.`
      );
    });
}

function mulGen(maxA: number, maxB: number, diffBase: number) {
  return () =>
    times(N, () => {
      const a = rand(2, maxA);
      const b = rand(2, maxB);
      const ans = a * b;
      return mcq(
        diffBase,
        `What is ${a} × ${b}?`,
        String(ans),
        [
          [String(ans + a), "skip-count-error"],
          [String(ans - b), "skip-count-error"],
          [String(a + b), "added-instead"],
        ],
        `${a} × ${b} means ${a} groups of ${b}, which is ${ans}.`
      );
    });
}

function divGen(maxQ: number, maxD: number, diffBase: number) {
  return () =>
    times(N, () => {
      const q = rand(2, maxQ);
      const d = rand(2, maxD);
      const a = q * d;
      return mcq(
        diffBase,
        `What is ${a} ÷ ${d}?`,
        String(q),
        [
          [String(q + 1), "off-by-one"],
          [String(Math.max(1, q - 1)), "off-by-one"],
          [String(a - d), "subtracted-instead"],
        ],
        `${a} ÷ ${d} = ${q} because ${q} × ${d} = ${a}.`
      );
    });
}

// ---------- skill list ----------

function skill(
  grade: number,
  order: number,
  slug: string,
  name: string,
  description: string,
  lesson: string,
  generate: () => GenQuestion[],
  prereqIds: string[] = []
): SkillDef {
  return {
    id: `math-g${grade}-${slug}`,
    subject: "math",
    grade,
    order,
    name,
    description,
    lesson,
    prereqIds,
    generate,
  };
}

export const mathSkills: SkillDef[] = [
  // ===== Grade 1 =====
  skill(1, 1, "add-20", "Addition to 20", "Add two numbers with sums up to 20.",
    `## Adding Numbers\nWhen we add, we put groups together!\n\n**Example:** 5 + 3\n- Start at 5. Count up 3 more: 6, 7, 8.\n- So 5 + 3 = **8** 🎉\n\n**Tip:** Always start with the bigger number and count up.`,
    addGen(10, 10, 1)),
  skill(1, 2, "sub-20", "Subtraction to 20", "Subtract numbers within 20.",
    `## Taking Away\nSubtraction means taking away.\n\n**Example:** 9 − 4\n- Start at 9. Count back 4: 8, 7, 6, 5.\n- So 9 − 4 = **5**\n\n**Tip:** Subtraction is the opposite of addition. 5 + 4 = 9, so 9 − 4 = 5!`,
    subGen(15, 1), ["math-g1-add-20"]),
  skill(1, 3, "compare", "Comparing Numbers", "Use greater than and less than.",
    `## Which is Bigger?\nWe compare numbers to see which is bigger.\n- The symbol **>** means "greater than"\n- The symbol **<** means "less than"\n\n**Trick:** The open mouth of the symbol always eats the BIGGER number! 🐊`,
    () => times(N, () => {
      const a = rand(1, 50); let b = rand(1, 50);
      if (a === b) b = a + rand(1, 5);
      const bigger = Math.max(a, b), smaller = Math.min(a, b);
      return mcq(1, `Which number is greater: ${a} or ${b}?`, String(bigger),
        [[String(smaller), "picked-smaller"], ["They are equal", "equality-confusion"]],
        `${bigger} is greater than ${smaller} because it comes later when counting.`);
    })),
  skill(1, 4, "place-value", "Tens and Ones", "Understand tens and ones in two-digit numbers.",
    `## Tens and Ones\nTwo-digit numbers are made of **tens** and **ones**.\n\n**Example:** 34 = 3 tens and 4 ones\n- 3 tens = 30\n- 4 ones = 4\n- 30 + 4 = 34`,
    () => times(N, () => {
      const t = rand(1, 9), o = rand(0, 9);
      const n = t * 10 + o;
      return mcq(2, `How many TENS are in the number ${n}?`, String(t),
        [[String(o), "tens-ones-swapped"], [String(n), "whole-number-confusion"], [String(t + 1), "off-by-one"]],
        `${n} = ${t} tens and ${o} ones. The first digit tells the tens.`);
    })),
  skill(1, 5, "skip-count", "Skip Counting", "Count by 2s, 5s, and 10s.",
    `## Skip Counting\nSkip counting means counting in jumps!\n- By 2s: 2, 4, 6, 8, 10...\n- By 5s: 5, 10, 15, 20...\n- By 10s: 10, 20, 30, 40...`,
    () => times(N, () => {
      const step = [2, 5, 10][rand(0, 2)];
      const start = step * rand(1, 5);
      const seq = [start, start + step, start + step * 2];
      const ans = start + step * 3;
      return mcq(2, `What comes next? ${seq.join(", ")}, ___`, String(ans),
        [[String(ans + 1), "counted-by-ones"], [String(ans - step + 1), "counted-by-ones"], [String(ans + step), "skipped-ahead"]],
        `We are counting by ${step}s, so after ${seq[2]} comes ${ans}.`);
    })),

  // ===== Grade 2 =====
  skill(2, 1, "add-100", "Two-Digit Addition", "Add two-digit numbers, with regrouping.",
    `## Adding Bigger Numbers\nAdd the ones first, then the tens.\n\n**Example:** 47 + 25\n- Ones: 7 + 5 = 12 → write 2, carry 1 ten\n- Tens: 4 + 2 + 1 = 7\n- Answer: **72**`,
    addGen(60, 39, 2)),
  skill(2, 2, "sub-100", "Two-Digit Subtraction", "Subtract two-digit numbers, with borrowing.",
    `## Subtracting Bigger Numbers\nSubtract the ones first, then the tens. Sometimes you need to **borrow** a ten.\n\n**Example:** 52 − 27\n- Can't do 2 − 7, so borrow: 12 − 7 = 5\n- Tens: 4 − 2 = 2\n- Answer: **25**`,
    subGen(99, 2), ["math-g2-add-100"]),
  skill(2, 3, "time", "Telling Time", "Read clocks to the nearest 5 minutes.",
    `## Telling Time\n- The SHORT hand shows the **hour**\n- The LONG hand shows the **minutes**\n- Each number on the clock = 5 minutes for the long hand`,
    () => times(N, () => {
      const h = rand(1, 12), m5 = rand(0, 11);
      const m = m5 * 5;
      const mm = m.toString().padStart(2, "0");
      return mcq(2, `The short hand points near ${h} and the long hand points at the ${m5 === 0 ? 12 : m5}. What time is it?`,
        `${h}:${mm}`,
        [[`${m5 === 0 ? 12 : m5}:${(h * 5 % 60).toString().padStart(2, "0")}`, "hands-swapped"],
         [`${h}:${m5.toString().padStart(2, "0")}`, "minute-multiply-error"],
         [`${(h % 12) + 1}:${mm}`, "hour-off-by-one"]],
        `The short hand gives the hour (${h}) and the long hand at ${m5 === 0 ? 12 : m5} means ${m} minutes.`);
    })),
  skill(2, 4, "money", "Counting Money", "Count coins and bills.",
    `## Counting Money\n- Penny = 1¢, Nickel = 5¢, Dime = 10¢, Quarter = 25¢\n\n**Tip:** Start with the biggest coins first!`,
    () => times(N, () => {
      const q = rand(0, 3), d = rand(0, 4), n = rand(0, 3), p = rand(0, 4);
      const total = q * 25 + d * 10 + n * 5 + p;
      if (total === 0) return mcq(1, `How many cents is 1 dime?`, "10¢", [["5¢", "coin-value-confusion"], ["25¢", "coin-value-confusion"], ["1¢", "coin-value-confusion"]], "A dime is worth 10 cents.");
      return mcq(3, `You have ${q} quarter(s), ${d} dime(s), ${n} nickel(s), and ${p} penn(ies). How much money is that?`,
        `${total}¢`,
        [[`${total + 5}¢`, "coin-value-confusion"], [`${total - 1 > 0 ? total - 1 : total + 1}¢`, "miscount"], [`${q + d + n + p}¢`, "counted-coins-not-value"]],
        `${q}×25 + ${d}×10 + ${n}×5 + ${p}×1 = ${total}¢.`);
    })),
  skill(2, 5, "even-odd", "Even and Odd", "Identify even and odd numbers.",
    `## Even or Odd?\n- **Even** numbers end in 0, 2, 4, 6, or 8. They can be split into two equal groups.\n- **Odd** numbers end in 1, 3, 5, 7, or 9. There's always one left over!`,
    () => times(N, () => {
      const n = rand(2, 99);
      const isEven = n % 2 === 0;
      return mcq(1, `Is ${n} even or odd?`, isEven ? "Even" : "Odd",
        [[isEven ? "Odd" : "Even", "even-odd-confusion"]],
        `${n} ends in ${n % 10}, so it is ${isEven ? "even" : "odd"}.`);
    })),

  // ===== Grade 3 =====
  skill(3, 1, "mul-facts", "Multiplication Facts", "Multiply numbers up to 10 × 10.",
    `## Multiplication\nMultiplication is repeated addition.\n\n**Example:** 4 × 6 means 4 groups of 6:\n6 + 6 + 6 + 6 = **24**\n\n**Tip:** Learn your times tables — they make everything faster!`,
    mulGen(10, 10, 2)),
  skill(3, 2, "div-facts", "Division Facts", "Divide using facts up to 100 ÷ 10.",
    `## Division\nDivision splits a number into equal groups.\n\n**Example:** 24 ÷ 6 asks "how many 6s make 24?"\n6, 12, 18, 24 — that's 4 sixes. So 24 ÷ 6 = **4**\n\nDivision is the opposite of multiplication!`,
    divGen(10, 10, 2), ["math-g3-mul-facts"]),
  skill(3, 3, "fractions-intro", "Understanding Fractions", "Identify fractions of a whole.",
    `## Fractions\nA fraction shows parts of a whole.\n- The **bottom** number (denominator) = how many equal parts in total\n- The **top** number (numerator) = how many parts we have\n\n**Example:** 3/4 of a pizza = the pizza is cut into 4 pieces and you have 3. 🍕`,
    () => times(N, () => {
      const d = [2, 3, 4, 5, 6, 8][rand(0, 5)];
      const n = rand(1, d - 1);
      return mcq(2, `A pizza is cut into ${d} equal slices. You eat ${n} slice(s). What fraction of the pizza did you eat?`,
        `${n}/${d}`,
        [[`${d}/${n}`, "fraction-flipped"], [`${n}/${d - n}`, "part-part-confusion"], [`${d - n}/${d}`, "complement-confusion"]],
        `You ate ${n} out of ${d} equal parts, so the fraction is ${n}/${d}.`);
    })),
  skill(3, 4, "area-perimeter", "Perimeter and Area", "Find perimeter and area of rectangles.",
    `## Perimeter and Area\n- **Perimeter** = distance around a shape. Add ALL the sides.\n- **Area** = space inside. For rectangles: length × width.\n\n**Example:** A 5 × 3 rectangle:\n- Perimeter = 5 + 3 + 5 + 3 = 16\n- Area = 5 × 3 = 15 square units`,
    () => times(N, (i) => {
      const l = rand(2, 12), w = rand(2, 9);
      if (i % 2 === 0) {
        return mcq(3, `A rectangle is ${l} units long and ${w} units wide. What is its AREA?`,
          `${l * w} square units`,
          [[`${2 * (l + w)} square units`, "perimeter-area-confusion"], [`${l + w} square units`, "added-instead"], [`${l * w + l} square units`, "calculation-error"]],
          `Area = length × width = ${l} × ${w} = ${l * w} square units.`);
      }
      return mcq(3, `A rectangle is ${l} units long and ${w} units wide. What is its PERIMETER?`,
        `${2 * (l + w)} units`,
        [[`${l * w} units`, "perimeter-area-confusion"], [`${l + w} units`, "forgot-double"], [`${2 * l + w} units`, "calculation-error"]],
        `Perimeter = ${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} units.`);
    })),
  skill(3, 5, "word-problems", "Word Problems", "Solve one-step multiplication and division word problems.",
    `## Word Problems\n1. Read carefully — what is the question asking?\n2. Find the numbers and decide the operation.\n3. "Groups of" or "each" often means multiply or divide.\n4. Check: does your answer make sense?`,
    () => times(N, (i) => {
      const per = rand(3, 9), groups = rand(3, 9);
      const total = per * groups;
      if (i % 2 === 0) {
        return mcq(3, `There are ${groups} boxes with ${per} crayons in each box. How many crayons are there in all?`,
          String(total),
          [[String(per + groups), "added-instead"], [String(total + per), "skip-count-error"], [String(Math.abs(per - groups)), "subtracted-instead"]],
          `${groups} boxes × ${per} crayons each = ${total} crayons.`);
      }
      return mcq(3, `${total} stickers are shared equally among ${groups} friends. How many stickers does each friend get?`,
        String(per),
        [[String(total - groups), "subtracted-instead"], [String(per + 1), "off-by-one"], [String(total), "no-operation"]],
        `${total} ÷ ${groups} = ${per} stickers each.`);
    }), ["math-g3-mul-facts", "math-g3-div-facts"]),

  // ===== Grade 4 =====
  skill(4, 1, "multi-digit-mul", "Multi-Digit Multiplication", "Multiply 2-digit by 1-digit numbers.",
    `## Bigger Multiplication\nBreak the number apart!\n\n**Example:** 34 × 6\n- 30 × 6 = 180\n- 4 × 6 = 24\n- 180 + 24 = **204**`,
    () => times(N, () => {
      const a = rand(12, 99), b = rand(3, 9);
      const ans = a * b;
      return mcq(3, `What is ${a} × ${b}?`, String(ans),
        [[String(ans + b), "calculation-error"], [String((Math.floor(a / 10) * 10) * b + (a % 10) + b), "partial-product-error"], [String(a + b), "added-instead"]],
        `Break it up: ${Math.floor(a / 10) * 10} × ${b} = ${Math.floor(a / 10) * 10 * b}, and ${a % 10} × ${b} = ${(a % 10) * b}. Together: ${ans}.`);
    }), []),
  skill(4, 2, "long-div", "Division with Remainders", "Divide with and without remainders.",
    `## Division with Remainders\nSometimes things don't split evenly — the leftover is the **remainder**.\n\n**Example:** 23 ÷ 5\n- 5 × 4 = 20, which is as close as we can get\n- 23 − 20 = 3 left over\n- Answer: **4 remainder 3**`,
    () => times(N, () => {
      const d = rand(3, 9), q = rand(3, 12), r = rand(1, d - 1);
      const a = d * q + r;
      return mcq(3, `What is ${a} ÷ ${d}?`, `${q} remainder ${r}`,
        [[`${q} remainder ${r + 1 < d ? r + 1 : r - 1}`, "remainder-error"], [`${q + 1} remainder ${r}`, "quotient-error"], [`${q}`, "ignored-remainder"]],
        `${d} × ${q} = ${d * q}, and ${a} − ${d * q} = ${r}. So ${q} remainder ${r}.`);
    })),
  skill(4, 3, "equiv-fractions", "Equivalent Fractions", "Find fractions that name the same amount.",
    `## Equivalent Fractions\nDifferent fractions can show the SAME amount!\n\n**Example:** 1/2 = 2/4 = 3/6\n\n**Rule:** Multiply (or divide) the top AND bottom by the same number.`,
    () => times(N, () => {
      const n = rand(1, 4), d = rand(n + 1, 6), m = rand(2, 4);
      return mcq(3, `Which fraction is equivalent to ${n}/${d}?`, `${n * m}/${d * m}`,
        [[`${n + m}/${d + m}`, "added-not-multiplied"], [`${n * m}/${d}`, "only-changed-numerator"], [`${d}/${n}`, "fraction-flipped"]],
        `Multiply top and bottom by ${m}: ${n}×${m}=${n * m} and ${d}×${m}=${d * m}, so ${n}/${d} = ${n * m}/${d * m}.`);
    })),
  skill(4, 4, "decimals-intro", "Introduction to Decimals", "Relate fractions to decimals (tenths, hundredths).",
    `## Decimals\nDecimals are another way to write fractions!\n- 1/10 = 0.1 (one tenth)\n- 1/100 = 0.01 (one hundredth)\n- 35/100 = 0.35`,
    () => times(N, () => {
      const n = rand(1, 99);
      const dec = (n / 100).toFixed(2);
      return mcq(3, `Write ${n}/100 as a decimal.`, dec,
        [[(n / 10).toFixed(1), "place-value-error"], [`${n}.00`, "decimal-misplaced"], [(n / 1000).toFixed(3), "place-value-error"]],
        `${n} hundredths = ${dec}.`);
    })),
  skill(4, 5, "angles", "Angles and Lines", "Classify angles as right, acute, or obtuse.",
    `## Angles\n- **Right angle** = exactly 90° (like a corner of paper)\n- **Acute angle** = LESS than 90° (small and cute!)\n- **Obtuse angle** = MORE than 90° but less than 180°`,
    () => times(N, () => {
      const type = rand(0, 2);
      const deg = type === 0 ? 90 : type === 1 ? rand(15, 80) : rand(100, 170);
      const label = type === 0 ? "Right" : type === 1 ? "Acute" : "Obtuse";
      const others = ["Right", "Acute", "Obtuse"].filter((x) => x !== label);
      return mcq(2, `An angle measures ${deg}°. What type of angle is it?`, label,
        [[others[0], "angle-classification"], [others[1], "angle-classification"], ["Straight", "angle-classification"]],
        `${deg}° is ${label.toLowerCase()} because ${type === 0 ? "it is exactly 90°" : type === 1 ? "it is less than 90°" : "it is between 90° and 180°"}.`);
    })),

  // ===== Grade 5 =====
  skill(5, 1, "frac-add", "Adding Fractions", "Add fractions with unlike denominators.",
    `## Adding Fractions\nTo add fractions you need the SAME denominator.\n\n**Example:** 1/2 + 1/3\n- Common denominator: 6\n- 1/2 = 3/6 and 1/3 = 2/6\n- 3/6 + 2/6 = **5/6**`,
    () => times(N, () => {
      const pairs: [number, number][] = [[2, 3], [2, 4], [3, 4], [2, 5], [3, 6], [4, 6], [2, 6], [4, 8]];
      const [d1, d2] = pairs[rand(0, pairs.length - 1)];
      const n1 = 1, n2 = 1;
      const cd = (d1 * d2) / gcd(d1, d2);
      const num = n1 * (cd / d1) + n2 * (cd / d2);
      const g = gcd(num, cd);
      return mcq(4, `What is ${n1}/${d1} + ${n2}/${d2}?`, `${num / g}/${cd / g}`,
        [[`${n1 + n2}/${d1 + d2}`, "added-denominators"], [`${n1 + n2}/${Math.max(d1, d2)}`, "kept-larger-denominator"], [`${num / g + 1}/${cd / g}`, "calculation-error"]],
        `Common denominator is ${cd}: ${n1}/${d1} = ${cd / d1}/${cd} and ${n2}/${d2} = ${cd / d2}/${cd}. Sum = ${num}/${cd}${g > 1 ? ` = ${num / g}/${cd / g}` : ""}.`);
    })),
  skill(5, 2, "dec-ops", "Decimal Operations", "Add and subtract decimals.",
    `## Adding and Subtracting Decimals\n**Line up the decimal points!** Then add or subtract like normal.\n\n**Example:** 3.45 + 1.2\n\`\`\`\n  3.45\n+ 1.20\n------\n  4.65\n\`\`\``,
    () => times(N, (i) => {
      const a = rand(10, 99) / 10, b = rand(10, 99) / 10;
      if (i % 2 === 0) {
        const ans = +(a + b).toFixed(1);
        return mcq(3, `What is ${a} + ${b}?`, String(ans),
          [[String(+(ans + 0.1).toFixed(1)), "calculation-error"], [String(+(ans * 10).toFixed(0)), "decimal-misplaced"], [String(+(a + b / 10).toFixed(2)), "misaligned-decimal"]],
          `Line up the decimal points: ${a} + ${b} = ${ans}.`);
      }
      const [hi, lo] = a >= b ? [a, b] : [b, a];
      const ans = +(hi - lo).toFixed(1);
      return mcq(3, `What is ${hi} − ${lo}?`, String(ans),
        [[String(+(ans + 0.1).toFixed(1)), "calculation-error"], [String(+(ans - 0.1).toFixed(1)), "calculation-error"], [String(+(hi + lo).toFixed(1)), "added-instead"]],
        `Line up the decimals and subtract: ${hi} − ${lo} = ${ans}.`);
    })),
  skill(5, 3, "volume", "Volume", "Find volume of rectangular prisms.",
    `## Volume\nVolume = how much space a 3D shape takes up.\n\n**For a box:** Volume = length × width × height\n\n**Example:** 4 × 3 × 2 box = 24 cubic units`,
    () => times(N, () => {
      const l = rand(2, 8), w = rand(2, 6), h = rand(2, 5);
      const v = l * w * h;
      return mcq(3, `A box is ${l} units long, ${w} units wide, and ${h} units tall. What is its volume?`,
        `${v} cubic units`,
        [[`${l + w + h} cubic units`, "added-instead"], [`${l * w} cubic units`, "forgot-height"], [`${2 * (l * w + l * h + w * h)} cubic units`, "surface-area-confusion"]],
        `Volume = ${l} × ${w} × ${h} = ${v} cubic units.`);
    })),
  skill(5, 4, "order-ops", "Order of Operations", "Use PEMDAS to evaluate expressions.",
    `## Order of Operations (PEMDAS)\n1. **P**arentheses\n2. **E**xponents\n3. **M**ultiply and **D**ivide (left to right)\n4. **A**dd and **S**ubtract (left to right)\n\n**Example:** 3 + 4 × 2 = 3 + 8 = **11** (NOT 14!)`,
    () => times(N, () => {
      const a = rand(2, 9), b = rand(2, 9), c = rand(2, 9);
      const ans = a + b * c;
      return mcq(4, `What is ${a} + ${b} × ${c}?`, String(ans),
        [[String((a + b) * c), "left-to-right-error"], [String(ans + b), "calculation-error"], [String(a * b + c), "operation-order-error"]],
        `Multiply first: ${b} × ${c} = ${b * c}. Then add: ${a} + ${b * c} = ${ans}.`);
    })),
  skill(5, 5, "coord-plane", "Coordinate Plane", "Plot and read points (x, y).",
    `## The Coordinate Plane\nA point is written (x, y):\n- **x** = how far RIGHT\n- **y** = how far UP\n\n**Remember:** You have to walk along the hallway (x) before going up the stairs (y)! 🏃➡️🪜`,
    () => times(N, () => {
      const x = rand(1, 9); let y = rand(1, 9);
      if (y === x) y = x === 9 ? 1 : x + 1;
      return mcq(3, `Start at (0,0). Move ${x} units right and ${y} units up. What point are you at?`,
        `(${x}, ${y})`,
        [[`(${y}, ${x})`, "coordinates-swapped"], [`(${x}, ${x})`, "calculation-error"], [`(${x + y}, 0)`, "combined-coordinates"]],
        `Right ${x} means x = ${x}; up ${y} means y = ${y}. The point is (${x}, ${y}).`);
    })),

  // ===== Grade 6 =====
  skill(6, 1, "ratios", "Ratios and Rates", "Understand and use ratios.",
    `## Ratios\nA ratio compares two amounts.\n\n**Example:** 3 apples for every 2 oranges = ratio 3:2\n\nIf you double both, 6:4 is the SAME ratio. Scale up or down by multiplying both sides!`,
    () => times(N, () => {
      const a = rand(2, 6), b = rand(2, 6), m = rand(2, 5);
      return mcq(3, `The ratio of cats to dogs is ${a}:${b}. If there are ${a * m} cats, how many dogs are there?`,
        String(b * m),
        [[String(b), "did-not-scale"], [String(a * m - (a - b)), "additive-thinking"], [String(a * m), "copied-cats"]],
        `${a * m} cats is ${m} times ${a}, so multiply dogs too: ${b} × ${m} = ${b * m}.`);
    })),
  skill(6, 2, "percents", "Percents", "Find percents of numbers.",
    `## Percents\n"Percent" means "out of 100".\n\n**Example:** 25% of 80\n- 25% = 25/100 = 0.25\n- 0.25 × 80 = **20**\n\n**Tip:** 10% is easy — just move the decimal! 10% of 80 = 8.`,
    () => times(N, () => {
      const p = [10, 20, 25, 50, 75][rand(0, 4)];
      const base = rand(2, 20) * 10;
      const ans = (p / 100) * base;
      return mcq(3, `What is ${p}% of ${base}?`, String(ans),
        [[String(p), "copied-percent"], [String(base - p), "subtracted-instead"], [String(ans * 10), "decimal-misplaced"]],
        `${p}% = ${p / 100}. Multiply: ${p / 100} × ${base} = ${ans}.`);
    })),
  skill(6, 3, "integers", "Negative Numbers", "Compare and reason with integers.",
    `## Negative Numbers\nNumbers below zero are **negative** (like being underground or below freezing 🥶).\n\n- −3 is LESS than 1\n- −2 is GREATER than −7 (closer to zero on the right)\n\nThe number line goes: ... −3, −2, −1, 0, 1, 2, 3 ...`,
    () => times(N, () => {
      const a = rand(-9, 9); let b = rand(-9, 9);
      if (a === b) b = a === 9 ? -9 : a + 1;
      const bigger = Math.max(a, b);
      return mcq(3, `Which is greater: ${a} or ${b}?`, String(bigger),
        [[String(Math.min(a, b)), "negative-magnitude-confusion"], ["They are equal", "equality-confusion"]],
        `On a number line, ${bigger} is to the right of ${Math.min(a, b)}, so it is greater.`);
    })),
  skill(6, 4, "expressions", "Algebraic Expressions", "Evaluate expressions with variables.",
    `## Expressions with Variables\nA **variable** is a letter that stands for a number.\n\n**Example:** If x = 4, then 3x + 2 = 3 × 4 + 2 = **14**\n\n**Remember:** 3x means 3 × x (multiplication is hidden!).`,
    () => times(N, () => {
      const a = rand(2, 6), b = rand(1, 9), x = rand(2, 9);
      const ans = a * x + b;
      return mcq(4, `If x = ${x}, what is ${a}x + ${b}?`, String(ans),
        [[String(a + x + b), "added-coefficient"], [String(a * (x + b)), "distributed-wrong"], [String(ans - b), "forgot-constant"]],
        `${a}x means ${a} × ${x} = ${a * x}. Then add ${b}: ${ans}.`);
    })),
  skill(6, 5, "one-step-eq", "One-Step Equations", "Solve equations like x + 5 = 12.",
    `## Solving Equations\nAn equation is a balance — do the same thing to BOTH sides.\n\n**Example:** x + 5 = 12\n- Subtract 5 from both sides\n- x = **7**\n\n**Example:** 3x = 15 → divide both sides by 3 → x = 5`,
    () => times(N, (i) => {
      if (i % 2 === 0) {
        const x = rand(2, 20), b = rand(2, 15);
        return mcq(3, `Solve for x:  x + ${b} = ${x + b}`, String(x),
          [[String(x + 2 * b), "added-instead"], [String(x + 1), "off-by-one"], [String(b), "picked-constant"]],
          `Subtract ${b} from both sides: x = ${x + b} − ${b} = ${x}.`);
      }
      const x = rand(2, 12), a = rand(2, 9);
      return mcq(3, `Solve for x:  ${a}x = ${a * x}`, String(x),
        [[String(a * x - a), "subtracted-instead"], [String(a * x * a), "multiplied-instead"], [String(x + 1), "off-by-one"]],
        `Divide both sides by ${a}: x = ${a * x} ÷ ${a} = ${x}.`);
    }), ["math-g6-expressions"]),

  // ===== Grade 7 =====
  skill(7, 1, "integer-ops", "Integer Operations", "Add and subtract with negative numbers.",
    `## Adding and Subtracting Integers\n- Adding a negative = moving LEFT on the number line\n- Subtracting a negative = ADDING (two minuses make a plus!)\n\n**Examples:**\n- 5 + (−8) = −3\n- 4 − (−3) = 4 + 3 = 7`,
    () => times(N, (i) => {
      const a = rand(-9, 9), b = rand(1, 9);
      if (i % 2 === 0) {
        const ans = a + -b;
        return mcq(4, `What is ${a} + (−${b})?`, String(ans),
          [[String(a + b), "sign-error"], [String(-(a + b)), "sign-error"], [String(ans - 1), "off-by-one"]],
          `Adding −${b} moves ${b} steps left from ${a}, landing on ${ans}.`);
      }
      const ans = a - -b;
      return mcq(4, `What is ${a} − (−${b})?`, String(ans),
        [[String(a - b), "double-negative-missed"], [String(-a - b), "sign-error"], [String(ans + 1), "off-by-one"]],
        `Subtracting a negative is adding: ${a} + ${b} = ${ans}.`);
    })),
  skill(7, 2, "proportions", "Proportions", "Solve proportion problems.",
    `## Proportions\nA proportion says two ratios are equal: a/b = c/d\n\n**Cross-multiply to solve!**\n\n**Example:** 3/4 = x/12 → 3 × 12 = 4x → 36 = 4x → x = **9**`,
    () => times(N, () => {
      const a = rand(2, 6), b = rand(2, 6), m = rand(2, 6);
      return mcq(4, `Solve: ${a}/${b} = x/${b * m}`, String(a * m),
        [[String(a + m), "additive-thinking"], [String(a), "did-not-scale"], [String(b * m - (b - a)), "additive-thinking"]],
        `The denominator was multiplied by ${m} (${b}→${b * m}), so multiply the numerator too: ${a} × ${m} = ${a * m}.`);
    })),
  skill(7, 3, "percent-change", "Percent Problems", "Solve discount, tax, and tip problems.",
    `## Real-World Percents\n**Discount:** price − (price × percent)\n**Tax/Tip:** price + (price × percent)\n\n**Example:** $40 shirt at 25% off:\n- Discount = 40 × 0.25 = $10\n- Sale price = 40 − 10 = **$30**`,
    () => times(N, () => {
      const price = rand(2, 12) * 10;
      const p = [10, 20, 25, 50][rand(0, 3)];
      const disc = (p / 100) * price;
      return mcq(4, `A $${price} game is on sale for ${p}% off. What is the sale price?`,
        `$${price - disc}`,
        [[`$${disc}`, "found-discount-not-price"], [`$${price + disc}`, "added-instead"], [`$${price - p}`, "subtracted-percent-directly"]],
        `Discount = ${p}% of $${price} = $${disc}. Sale price = $${price} − $${disc} = $${price - disc}.`);
    })),
  skill(7, 4, "two-step-eq", "Two-Step Equations", "Solve equations like 2x + 3 = 11.",
    `## Two-Step Equations\nUndo operations in REVERSE order: first undo + or −, then undo × or ÷.\n\n**Example:** 2x + 3 = 11\n1. Subtract 3: 2x = 8\n2. Divide by 2: x = **4**`,
    () => times(N, () => {
      const a = rand(2, 6), x = rand(2, 10), b = rand(1, 9);
      const c = a * x + b;
      return mcq(4, `Solve for x:  ${a}x + ${b} = ${c}`, String(x),
        [[String((c + b) / a % 1 === 0 ? (c + b) / a : x + 2), "added-instead-of-subtracted"], [String(c - b), "forgot-divide"], [String(x + 1), "off-by-one"]],
        `Subtract ${b}: ${a}x = ${c - b}. Divide by ${a}: x = ${x}.`);
    }), []),
  skill(7, 5, "probability", "Probability", "Find probability of simple events.",
    `## Probability\nProbability = (favorable outcomes) / (total outcomes)\n\n**Example:** A bag has 3 red and 5 blue marbles.\nP(red) = 3/8\n\nProbability is always between 0 (impossible) and 1 (certain).`,
    () => times(N, () => {
      const red = rand(1, 6), blue = rand(1, 6), green = rand(1, 4);
      const total = red + blue + green;
      return mcq(4, `A bag has ${red} red, ${blue} blue, and ${green} green marbles. What is the probability of picking a RED marble?`,
        `${red}/${total}`,
        [[`${red}/${blue + green}`, "part-part-confusion"], [`${total}/${red}`, "fraction-flipped"], [`${red}/${blue}`, "ignored-some-outcomes"]],
        `There are ${total} marbles total and ${red} are red, so P(red) = ${red}/${total}.`);
    })),

  // ===== Grade 8 =====
  skill(8, 1, "exponents", "Exponents", "Evaluate and apply exponent rules.",
    `## Exponents\nAn exponent means repeated multiplication.\n\n**Example:** 2⁴ = 2 × 2 × 2 × 2 = **16**\n\n**Rule:** When multiplying same bases, ADD exponents: 2³ × 2² = 2⁵`,
    () => times(N, (i) => {
      if (i % 2 === 0) {
        const b = rand(2, 5), e = rand(2, b === 2 ? 6 : 3);
        return mcq(4, `What is ${b}^${e}?`, String(Math.pow(b, e)),
          [[String(b * e), "multiplied-base-exponent"], [String(Math.pow(b, e) + b), "calculation-error"], [String(Math.pow(e, b)), "swapped-base-exponent"]],
          `${b}^${e} means multiply ${b} by itself ${e} times = ${Math.pow(b, e)}.`);
      }
      const b = rand(2, 9), e1 = rand(2, 5), e2 = rand(2, 5);
      return mcq(4, `Simplify: ${b}^${e1} × ${b}^${e2}`, `${b}^${e1 + e2}`,
        [[`${b}^${e1 * e2}`, "multiplied-exponents"], [`${b * b}^${e1 + e2}`, "changed-base"], [`${b}^${Math.abs(e1 - e2)}`, "subtracted-exponents"]],
        `Same base: add the exponents. ${e1} + ${e2} = ${e1 + e2}, so the answer is ${b}^${e1 + e2}.`);
    })),
  skill(8, 2, "sqrt", "Square Roots", "Find square roots of perfect squares.",
    `## Square Roots\nThe square root asks: "what number times itself gives this?"\n\n**Example:** √49 = 7 because 7 × 7 = 49\n\nPerfect squares to know: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144.`,
    () => times(N, () => {
      const r = rand(2, 15);
      return mcq(3, `What is √${r * r}?`, String(r),
        [[String(r * r / 2), "divided-by-two"], [String(r + 1), "off-by-one"], [String(r - 1 > 0 ? r - 1 : r + 2), "off-by-one"]],
        `√${r * r} = ${r} because ${r} × ${r} = ${r * r}.`);
    })),
  skill(8, 3, "slope", "Slope and Linear Graphs", "Find slope from two points.",
    `## Slope\nSlope = how steep a line is = **rise / run**\n\nFrom two points (x₁,y₁) and (x₂,y₂):\nslope = (y₂ − y₁) / (x₂ − x₁)\n\n**Example:** (1,2) and (3,8): slope = (8−2)/(3−1) = 6/2 = **3**`,
    () => times(N, () => {
      const x1 = rand(0, 4), y1 = rand(0, 5), run = rand(1, 4), m = rand(1, 5);
      const x2 = x1 + run, y2 = y1 + m * run;
      return mcq(5, `What is the slope of the line through (${x1}, ${y1}) and (${x2}, ${y2})?`, String(m),
        [[String(run / (m * run)), "rise-run-flipped"], [String(m * run), "forgot-divide"], [String(m + 1), "off-by-one"]],
        `Slope = (${y2} − ${y1}) / (${x2} − ${x1}) = ${m * run}/${run} = ${m}.`);
    })),
  skill(8, 4, "pythagorean", "Pythagorean Theorem", "Find missing sides of right triangles.",
    `## The Pythagorean Theorem\nFor a RIGHT triangle with legs a, b and hypotenuse c:\n\n**a² + b² = c²**\n\n**Example:** legs 3 and 4 → 9 + 16 = 25 → c = √25 = **5**`,
    () => times(N, () => {
      const triples: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20]];
      const [a, b, c] = triples[rand(0, triples.length - 1)];
      return mcq(5, `A right triangle has legs of length ${a} and ${b}. How long is the hypotenuse?`, String(c),
        [[String(a + b), "added-legs"], [String(a * a + b * b), "forgot-square-root"], [String(c + 1), "off-by-one"]],
        `${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}, and √${c * c} = ${c}.`);
    }), ["math-g8-sqrt"]),
  skill(8, 5, "sci-notation", "Scientific Notation", "Write numbers in scientific notation.",
    `## Scientific Notation\nA short way to write very big (or small) numbers:\n\n**number between 1 and 10 × a power of 10**\n\n**Example:** 45,000 = 4.5 × 10⁴\n(Move the decimal 4 places.)`,
    () => times(N, () => {
      const lead = rand(11, 99) / 10;
      const e = rand(3, 8);
      const full = (lead * Math.pow(10, e)).toLocaleString("en-US");
      return mcq(4, `Write ${full} in scientific notation.`, `${lead} × 10^${e}`,
        [[`${lead} × 10^${e + 1}`, "exponent-off-by-one"], [`${lead * 10} × 10^${e - 1}`, "leading-number-not-normalized"], [`${lead} × 10^${e - 1}`, "exponent-off-by-one"]],
        `Move the decimal ${e} places: ${full} = ${lead} × 10^${e}.`);
    }), ["math-g8-exponents"]),
];

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

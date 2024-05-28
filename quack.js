const TELEGRAM_USER = require("./token.json");
let ACCESS_TOKEN = TELEGRAM_USER.state.token;

let listColect = [];
let listDuck = [];

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

async function getTotalEgg() {
  try {
    let response = await fetch("https://api.quackquack.games/balance/get", {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",
        authorization: "Bearer " + ACCESS_TOKEN,
      },
      body: null,
      method: "GET",
    });
    let data = await response.json();
    // console.log(data);
    if (data.error_code !== "") console.log(data.error_code);

    console.log(`-----------------------------------`);
    data.data.data.map((item) => {
      if (item.symbol === "PET") console.log(`Ban dang co: ${item.balance} 🐸`);
      if (item.symbol === "EGG") console.log(`Ban dang co: ${item.balance} 🥚`);
    });
    console.log(`-----------------------------------`);
    getListCollectEgg();
  } catch (error) {
    // console.log("getTotalEgg", error);
    console.log("Mat ket noi getTotalEgg, thu lai sau 3s");
    setTimeout(getTotalEgg, 3e3);
  }
}

async function getListCollectEgg() {
  try {
    listColect = [];
    listDuck = [];

    let response = await fetch(
      "https://api.quackquack.games/nest/list-reload",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9,vi;q=0.8",
          authorization: "Bearer " + ACCESS_TOKEN,
        },
        body: null,
        method: "GET",
      }
    );
    let data = await response.json();
    // console.log(data);
    if (data.error_code !== "") console.log(data.error_code);

    data.data.duck.map((item) => {
      // console.log(item);
      listDuck.push(item);
    });

    data.data.nest.map((item) => {
      // console.log(item);
      if (item.type_egg) listColect.push(item);
    });

    let eggs = listColect.map((i) => i.id);
    // console.log(eggs);

    if (listColect.length > 0) {
      console.log(`So 🥚 co the thu thap: ${listColect.length}`, eggs);
      collect();
    }
  } catch (error) {
    // console.log("getListCollectEgg error:", error);
    console.log("Mat ket noi getListCollectEgg, thu lai sau 3s");
    setTimeout(getListCollectEgg, 3e3);
  }
}

async function collect() {
  try {
    if (listColect.length === 0) return getTotalEgg();

    const egg = listColect[0];
    // console.log(egg);

    let response = await fetch("https://api.quackquack.games/nest/collect", {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",
        authorization: "Bearer " + ACCESS_TOKEN,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: "nest_id=" + egg.id,
      method: "POST",
    });
    let data = await response.json();
    // console.log(data);

    if (data.error_code !== "") console.log(data.error_code);

    const duck = getDuckToLay();
    layEgg(egg, duck);
  } catch (error) {
    // console.log("collect error:", error);
    console.log("Mat ket noi collect, thu lai sau 3s");
    setTimeout(collect, 3e3);
  }
}

function getDuckToLay() {
  let duck = null;
  let now = Number((Date.now() / 1e3).toFixed(0));

  listDuck.forEach((duck) => {
    if (duck.last_active_time < now) now = duck.last_active_time;
  });
  listDuck.map((item) => {
    if (item.last_active_time === now) duck = item;
  });

  return duck;
}

async function layEgg(egg, duck) {
  try {
    // console.log(`${duck.id}:${egg.id}`);

    let response = await fetch("https://api.quackquack.games/nest/lay-egg", {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",
        authorization: "Bearer " + ACCESS_TOKEN,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: "nest_id=" + egg.id + "&duck_id=" + duck.id,
      method: "POST",
    });
    let data = await response.json();
    // console.log(data);

    if (data.error_code !== "") {
      console.log(data.error_code);
      const duck = getDuckToLay();
      layEgg(egg, duck);
    } else {
      console.log(`Da thu thap 🥚 ${egg.id}`);
      listColect.shift();
      listDuck = listDuck.filter((d) => d.id !== duck.id);
      setTimeout(collect, 3e3);
    }
  } catch (error) {
    // console.log("layEgg error:", error);
    console.log("Mat ket noi layEgg, thu lai sau 3s");
    setTimeout(() => {
      layEgg(egg, duck);
    }, 3e3);
  }
}

getGoldDuckInfo().then(getTotalEgg);

setInterval(() => console.clear(), 3e5);

async function getGoldDuckInfo() {
  try {
    let response = await fetch(
      "https://api.quackquack.games/golden-duck/info",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9,vi;q=0.8",
          authorization: "Bearer " + ACCESS_TOKEN,
        },
        body: null,
        method: "GET",
      }
    );
    let data = await response.json();
    // console.log(data);

    if (data.error_code !== "") console.log(data.error_code);

    console.log(``);
    if (data.data.time_to_golden_duck !== 0) {
      let nextGoldDuck = data.data.time_to_golden_duck;
      console.log(`🐙 ${Number(nextGoldDuck / 60).toFixed(0)} phut nua gap`);
      console.log(``);
      setTimeout(getGoldDuckInfo, nextGoldDuck * 1e3);
    } else getGoldDuckReward();
  } catch (error) {
    // console.log("getGoldDuckInfo error", error);
    console.log("Mat ket noi getGoldDuckInfo, thu lai sau 3s");
    setTimeout(getGoldDuckInfo, 3e3);
  }
}

async function getGoldDuckReward() {
  try {
    let response = await fetch(
      "https://api.quackquack.games/golden-duck/reward",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9,vi;q=0.8",
          authorization: "Bearer " + ACCESS_TOKEN,
        },
        body: null,
        method: "GET",
      }
    );
    let data = await response.json();
    // console.log(data);

    if (data.error_code !== "") console.log(data.error_code);

    if (data.data.type === 0) {
      console.log(`🐙 Chuc ban may man lan sau`);
      getGoldDuckInfo();
    }

    if (data.data.type === 2 || data.data.type === 3) claimGoldDuck(data.data);
  } catch (error) {
    // console.log("getGoldDuckReward error", error);
    console.log("Mat ket noi getGoldDuckReward, thu lai sau 3s");
    setTimeout(getGoldDuckReward, 3e3);
  }
}

function infoGoldDuck(data) {
  if (data.type === 1) return { label: "TON", amount: data.amount };
  if (data.type === 2) return { label: "PEPET", amount: data.amount };
  if (data.type === 3) return { label: "EGG", amount: data.amount };
  if (data.type === 4) return { label: "TRU", amount: data.amount };
}

async function claimGoldDuck(gDuck) {
  try {
    let response = await fetch(
      "https://api.quackquack.games/golden-duck/claim",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9,vi;q=0.8",
          authorization: "Bearer " + ACCESS_TOKEN,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: "type=1",
        method: "POST",
      }
    );
    let data = await response.json();
    // console.log(data);

    if (data.error_code !== "") console.log(data.error_code);

    let info = infoGoldDuck(gDuck);
    console.log(`🐙 ${info.amount} ${info.label}`);
    console.log();

    getGoldDuckInfo();
  } catch (error) {
    // console.log("claimGoldDuck error", error);
    console.log("Mat ket noi claimGoldDuck, thu lai sau 3s");
    setTimeout(claimGoldDuck, 3e3);
  }
}

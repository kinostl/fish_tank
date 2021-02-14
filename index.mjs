import { start, dispatch, stop, spawn } from "nact";
const system = start();
const fish = [];
const delay = (time) => new Promise((res) => setTimeout(res, time));

const tank = spawn(
  system,
  async (state = { fish: {} }, msg, ctx) => {
    if (msg.type === "LOOK") {
      let view = Object.values(state.fish).reduce(
        (acc, { x, y, picture }) => {
          if (!acc[x]) acc[x] = [];
          acc[x][y] = picture;
          return acc;
        },
        []
      );
      view = view.map((v)=>v.join(' ')).join('\n')
      console.clear()
      console.log(view)
      return state;
    }
    if (msg.type === "UPDATE") {
      const { id } = msg.payload;
      state.fish[id] = msg.payload;
      return state;
    }
  },
  "fish_tank"
);

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function createFish() {
  const fish_id = `fish_${fish.length}`;
  const new_fish = spawn(
    system,
    async (state = {}, msg, ctx) => {
      if (state.picture) {
        //do fish stuff
        const direction = getRandomInt(4);
        if(direction === 0) state.y++;
        if(direction === 1) state.x++;
        if(direction === 2) state.y--;
        if(direction === 3) state.x--;
        if(state.x<0) state.x=0;
        if(state.y<0) state.y=0;
      } else {
        state = {
          id: fish_id,
          x: 0,
          y: 0,
          picture: "+",
        };
      }
      dispatch(tank, { type: "UPDATE", payload: state });
      return state;
    },
    fish_id
  );
  fish.push(new_fish);
}

createFish();
createFish();
createFish();
createFish();
createFish();
while (true) {
  fish.forEach(async (fis) => {
    dispatch(fis, {});
  });
  await delay(250);
  dispatch(tank, { type: "LOOK" });
}

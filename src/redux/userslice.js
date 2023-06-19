import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  loginstatus: "",
  username: sessionStorage.getItem("username") || "",
  userLoggedIn: !!sessionStorage.getItem("username"),
  user: { id: 0, username: "", email: "", favourites: [] },
  registerstatus: "failure",
};

export const loginUser = createAsyncThunk("login/User", async (user) => {
  let response = await fetch(
    `http://localhost:3000/users?username=${user.username}`
  );
  let fetchuser = await response.json();
  console.log("fetchuser: ", fetchuser);
  console.log("user: ", user);
  console.log("fetchuser.length > 0: ", fetchuser.length > 0);
  console.log("fetchuser[0].password === user.password: ", fetchuser[0].password === user.password);
  if (fetchuser.length > 0 && fetchuser[0].password === user.password){
    console.log("promise resolved successfully");
    return Promise.resolve(fetchuser[0].username);
    }
  return Promise.reject("error");
});

export const fetchUserByUsername = createAsyncThunk(
  "fetch/User",
  async (username) => {
    let response = await fetch(
      `http://localhost:3000/users?username=${username}`
    );
    return response.json();
  }
);

export const registerUser = createAsyncThunk("register/User", async (user) => {
  let response = await fetch(`http://localhost:3000/users`, {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
    },
  });
  let data = await response.json();
  if (data !== null || data !== undefined) return Promise.resolve("success");
  return Promise.reject("failure");
});

const userslice = createSlice({
  name: "users",
  initialState,
  reducers: {
    logoutUser: (state, action) => {
      sessionStorage.removeItem("username");
      state.loginstatus = "failure";
      state.userLoggedIn = false;
      state.username = "";
    },
    changeRegisterStatus: (state) => {
      state.registerstatus = "failure";
    },
  },
  extraReducers(builder) {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loginstatus = "success";
      state.username = action.payload;
      state.userLoggedIn = true;
      sessionStorage.setItem("username", state.username);
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loginstatus = "failure";
      state.username = "";
      state.userLoggedIn = false;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.registerstatus = "success";
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.registerstatus = "failure";
    });
    builder.addCase(fetchUserByUsername.fulfilled, (state, action) => {
      state.user = action.payload[0];
    });
  },
});

export let { userLoggedIn } = (state) => state.userreducer.userLoggedIn;
export let { logoutUser, changeRegisterStatus } = userslice.actions;

export default userslice.reducer;

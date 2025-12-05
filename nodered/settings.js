module.exports = {
  uiHost: "0.0.0.0",
  uiPort: 1880,

  adminAuth: {
    type: "credentials",
    users: [
      {
        username: "admin",
        password:
          "$2y$08$1/VvG.5RV5dK08GRGU1xoOrWKPTRcat2OyozBAy/go/xx2QkVJx0G",
        permissions: "*",
      },
    ],
  },
};

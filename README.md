# rugby-overlay
A live-streaming overlay system for rugby.
Tested to work with OBS, with mixing resolution set to 1920x1080.

**Installation:**

After installing node.js, clone this repository to a local directory, open a command line terminal to it, and run:

npm install
node server.js

The operator view and stream overlay will be accessible at:

```
http://127.0.0.1:8080/operator.html
http://127.0.0.1:8080/overlay.html
```

Some widgets to build hype screens:
```
http://127.0.0.1:8080/countdown.html
http://127.0.0.1:8080/statebanner.html
http://127.0.0.1:8080/team_vs_team.html
```

The system is pretty much at MVP state. Some UI elements don't work.

Place team logos in the /html/images folder and they will be automatically scanned on server load.

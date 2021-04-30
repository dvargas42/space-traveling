import { Component } from "react";

export default class Comment extends Component {

  componentDidMount () {
      let script = document.createElement("script");
      let anchor = document.getElementById("inject-comments-for-uterances");
      script.setAttribute("src", "https://utteranc.es/client.js");
      script.setAttribute("crossorigin","anonymous");
      script.setAttribute("async", 'true');
      script.setAttribute("repo", "dvargas42/space-traveling");
      script.setAttribute("issue-term", "pathname");
      script.setAttribute( "theme", "dark-blue");
      anchor.appendChild(script);
  }

  render() {
    return (
        <div id="inject-comments-for-uterances"></div>
    );
  }
}
 {/* <script src="https://utteranc.es/client.js"
        repo="dvargas42 / comments-space-traveling"
        issue-term="pathname"
        theme="github-dark"
        crossorigin="anonymous"
        async>
      </script> */}
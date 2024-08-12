export const tesseractPattern = `
<style>
body {
  background-color: white;
  background-image: linear-gradient(45deg, pink 25%, transparent 25%),
                    linear-gradient(-45deg, pink 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, dodgerblue 75%),
                    linear-gradient(-45deg, transparent 75%, dodgerblue 75%);
  background-size: 25vmin 25vmin;
  background-position: 12.5vmin 0,
                       -12.5vmin 12.5vmin,
                       12.5vmin -12.5vmin,
                       -12.5vmin 0;
  animation: color 4000ms cubic-bezier(0.76, 0, 0.24, 1) infinite,
             position 4000ms cubic-bezier(0.76, 0, 0.24, 1) infinite;
}

@keyframes color {
  0%, 25% {
    background-color: white;
  }
  26%, 50% {
    background-color: pink;
  }
  51%, 75% {
    background-color: white;
  }
  76%, 100% {
    background-color: dodgerblue;
  }
}

@keyframes position {
  0% {
    background-position: 12.5vmin 0,
                         -12.5vmin 12.5vmin,
                         12.5vmin -12.5vmin,
                         -12.5vmin 0;
  }
  25% {
    background-position: 12.5vmin 50vmin,
                         -12.5vmin 62.5vmin,
                         12.5vmin 37.5vmin,
                         -12.5vmin 50vmin;
  }
  50% {
    background-position: 37.5vmin 100vmin,
                         -37.5vmin 112.5vmin,
                         25vmin 87.5vmin,
                         -25vmin 100vmin;
  }
  75% {
    background-position: 37.5vmin 150vmin,
                         -37.5vmin 162.5vmin,
                         25vmin 137.5vmin,
                         -25vmin 150vmin;
  }
  100% {
    background-position: 62.5vmin 200vmin,
                         -62.5vmin 212.5vmin,
                         62.5vmin 187.5vmin,
                         -62.5vmin 200vmin;
  }
}

@media (prefers-reduced-motion) {
  body {
    animation: none;
  }
}
</style>
`;

export const squareGrid = `
<html lang="en">
<head>
<style>
html {
  --s: 100px;
  --c1: #C3CCAF;
  --c2: #67434F;
  --_s: calc(2 * 100px) calc(2 * 100px);
  --_g: calc(2 * 100px) calc(2 * 100px) conic-gradient(at 40% 40%, #0000 75%, #C3CCAF 0);
  --_p: calc(2 * 100px) calc(2 * 100px) conic-gradient(at 20% 20%, #0000 75%, #67434F 0);
  background:
    calc(0.9 * 100px) calc(0.9 * 100px) / var(--_p),
    calc(-0.1 * 100px) calc(-0.1 * 100px) / var(--_p),
    calc(0.7 * 100px) calc(0.7 * 100px) / var(--_g),
    calc(-0.3 * 100px) calc(-0.3 * 100px) / var(--_g),
    conic-gradient(from 90deg at 20% 20%, #67434F 25%, #C3CCAF 0) 0 0 / 100px 100px;
  animation: m 3s infinite;
}

@keyframes m {
  0% {
    background-position:
      calc(0.9 * 100px) calc(0.9 * 100px),
      calc(-0.1 * 100px) calc(-0.1 * 100px),
      calc(0.7 * 100px) calc(0.7 * 100px),
      calc(-0.3 * 100px) calc(-0.3 * 100px),
      0 0;
  }
  25% {
    background-position:
      calc(1.9 * 100px) calc(0.9 * 100px),
      calc(-1.1 * 100px) calc(-0.1 * 100px),
      calc(1.7 * 100px) calc(0.7 * 100px),
      calc(-1.3 * 100px) calc(-0.3 * 100px),
      0 0;
  }
  50% {
    background-position:
      calc(1.9 * 100px) calc(-0.1 * 100px),
      calc(-1.1 * 100px) calc(0.9 * 100px),
      calc(1.7 * 100px) calc(-0.3 * 100px),
      calc(-1.3 * 100px) calc(0.7 * 100px),
      0 0;
  }
  75% {
    background-position:
      calc(2.9 * 100px) calc(-0.1 * 100px),
      calc(-2.1 * 100px) calc(0.9 * 100px),
      calc(2.7 * 100px) calc(-0.3 * 100px),
      calc(-2.3 * 100px) calc(0.7 * 100px),
      0 0;
  }
  100% {
    background-position:
      calc(2.9 * 100px) calc(-1.1 * 100px),
      calc(-2.1 * 100px) calc(1.9 * 100px),
      calc(2.7 * 100px) calc(-1.3 * 100px),
      calc(-2.3 * 100px) calc(1.7 * 100px),
      0 0;
  }
}
</style>
`;

export const gradientAndWave = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Waves Animation</title>
    <style>
        body {
            margin: auto;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            overflow: auto;
            background: linear-gradient(315deg, rgba(101,0,94,1) 3%, rgba(60,132,206,1) 38%, rgba(48,238,226,1) 68%, rgba(255,25,25,1) 98%);
            animation: gradient 15s ease infinite;
            background-size: 400% 400%;
            background-attachment: fixed;
        }

        @keyframes gradient {
            0% { background-position: 0 0; }
            50% { background-position: 100% 100%; }
            100% { background-position: 0 0; }
        }

        .wave {
            background: rgb(255 255 255 / 25%);
            border-radius: 1000% 1000% 0 0;
            position: fixed;
            width: 200%;
            height: 12em;
            animation: wave 10s -3s linear infinite;
            transform: translate3d(0, 0, 0);
            opacity: 0.8;
            bottom: 0;
            left: 0;
            z-index: -1;
        }

        .wave:nth-of-type(2) {
            bottom: -1.25em;
            animation: wave 18s linear reverse infinite;
            opacity: 0.8;
        }

        .wave:nth-of-type(3) {
            bottom: -2.5em;
            animation: wave 20s -1s reverse infinite;
            opacity: 0.9;
        }

        @keyframes wave {
            2% { transform: translateX(1); }
            25% { transform: translateX(-25%); }
            50% { transform: translateX(-50%); }
            75% { transform: translateX(-25%); }
            100% { transform: translateX(1); }
        }
    </style>
</head>
<body>
    <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave">div>
    </div>
</body>
</html>
`;

export const colorBlobs = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SVG Animation</title><style>body{background-color:#fee440;margin:0;padding:0}svg{position:fixed;top:0;left:0;width:100%;height:100vh}.links{position:fixed;bottom:20px;right:20px;font-size:18px;font-family:sans-serif}a{text-decoration:none;color:#000;margin-left:1em}a:hover{text-decoration:underline}a img.icon{display:inline-block;height:1em;margin:0 0 -.1em .3em}@keyframes rotate{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}.out-top{animation:rotate 20s linear infinite;transform-origin:13px 25px}.in-top{animation:rotate 10s linear infinite;transform-origin:13px 25px}.out-bottom{animation:rotate 25s linear infinite;transform-origin:84px 93px}.in-bottom{animation:rotate 15s linear infinite;transform-origin:84px 93px}</style></head><body><svg preserveAspectRatio="xMidYMid slice" viewBox="10 10 80 80"><path fill="#9b5de5" class="out-top" d="M37-5C25.1-14.7,5.7-19.1-9.2-10-28.5,1.8-32.7,31.1-19.8,49c15.5,21.5,52.6,22,67.2,2.3C59.4,35,53.7,8.5,37-5Z"/><path fill="#f15bb5" class="in-top" d="M20.6,4.1C11.6,1.5-1.9,2.5-8,11.2-16.3,23.1-8.2,45.6,7.4,50S42.1,38.9,41,24.5C40.2,14.1,29.4,6.6,20.6,4.1Z"/><path fill="#00bbf9" class="out-bottom" d="M105.9,48.6c-12.4-8.2-29.3-4.8-39.4.8-23.4,12.8-37.7,51.9-19.1,74.1s63.9,15.3,76-5.6c7.6-13.3,1.8-31.1-2.3-43.8C117.6,63.3,114.7,54.3,105.9,48.6Z"/><path fill="#00f5d4" class="in-bottom" d="M102,67.1c-9.6-6.1-22-3.1-29.5,2-15.4,10.7-19.6,37.5-7.6,47.8s35.9,3.9,44.5-12.5C115.5,92.6,113.9,74.6,102,67.1Z"/></svg></body></html>`;

export const shootingStar = `<!DOCTYPE html><html><head><style>@media screen and (max-width:750px){.star{animation:fall var(--fall-duration) var(--fall-delay) linear infinite}}body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:radial-gradient(ellipse at bottom,#0d1d31 0,#0c0d13 100%);overflow:hidden}.stars{position:fixed;top:0;left:0;width:100%;height:120%;transform:rotate(-45deg)}.star{--star-color:var(--primary-color);--star-tail-length:6em;--star-tail-height:2px;--star-width:calc(var(--star-tail-length) / 6);--fall-duration:9s;--tail-fade-duration:var(--fall-duration);position:absolute;top:var(--top-offset);left:0;width:var(--star-tail-length);height:var(--star-tail-height);color:var(--star-color);background:linear-gradient(45deg,currentColor,transparent);border-radius:50%;filter:drop-shadow(0 0 6px currentColor);transform:translate3d(104em,0,0);animation:fall var(--fall-duration) var(--fall-delay) linear infinite,tail-fade var(--tail-fade-duration) var(--fall-delay) ease-out infinite}.star:nth-child(1){--star-tail-length:5.75em;--top-offset:66.26vh;--fall-duration:9.397s;--fall-delay:6.845s;--star-color:#FFF4C4}.star:nth-child(2){--star-tail-length:5.2em;--top-offset:22.11vh;--fall-duration:10.252s;--fall-delay:0.776s;--star-color:#FFD700}.star:nth-child(3){--star-tail-length:6.41em;--top-offset:60.77vh;--fall-duration:7.865s;--fall-delay:9.192s;--star-color:#FFF8DC}.star:nth-child(4){--star-tail-length:6.64em;--top-offset:26.11vh;--fall-duration:6.215s;--fall-delay:3.028s;--star-color:#FFE4B5}.star:nth-child(5){--star-tail-length:6.15em;--top-offset:34.09vh;--fall-duration:6.613s;--fall-delay:8.54s;--star-color:#FFDAB9}.star:nth-child(6){--star-tail-length:6.14em;--top-offset:59.3vh;--fall-duration:8.58s;--fall-delay:9.71s;--star-color:#FFEFD5}.star:nth-child(7){--star-tail-length:7.06em;--top-offset:60.39vh;--fall-duration:11.042s;--fall-delay:2.45s;--star-color:#FFEBCD}.star:nth-child(8){--star-tail-length:5.65em;--top-offset:74.01vh;--fall-duration:9.523s;--fall-delay:4.499s;--star-color:#FFE4E1}.star:nth-child(9){--star-tail-length:5.01em;--top-offset:25.24vh;--fall-duration:7.484s;--fall-delay:5.277s;--star-color:#FFDAB9}.star:nth-child(10){--star-tail-length:5.4em;--top-offset:46.03vh;--fall-duration:8.326s;--fall-delay:6.699s;--star-color:#FFF0F5}.star:nth-child(11){--star-tail-length:6.87em;--top-offset:85.73vh;--fall-duration:9.024s;--fall-delay:7.167s;--star-color:#FFE4C4}.star:nth-child(12){--star-tail-length:6.26em;--top-offset:57.21vh;--fall-duration:11.552s;--fall-delay:0.136s;--star-color:#FFFACD}.star:nth-child(13){--star-tail-length:6.33em;--top-offset:94.94vh;--fall-duration:9.768s;--fall-delay:7.759s;--star-color:#FAFAD2}.star:nth-child(14){--star-tail-length:5.73em;--top-offset:0.77vh;--fall-duration:9.42s;--fall-delay:0.412s;--star-color:#FFFFE0}.star:nth-child(15){--star-tail-length:5.62em;--top-offset:37.99vh;--fall-duration:9.219s;--fall-delay:9.572s;--star-color:#FFF5EE}.star:nth-child(16){--star-tail-length:5.16em;--top-offset:74.31vh;--fall-duration:11.444s;--fall-delay:8.965s;--star-color:#F0FFF0}.star:nth-child(17){--star-tail-length:7.38em;--top-offset:73.1vh;--fall-duration:10.709s;--fall-delay:2.344s;--star-color:#F5FFFA}.star:nth-child(18){--star-tail-length:6.26em;--top-offset:38.91vh;--fall-duration:11.112s;--fall-delay:3.949s;--star-color:#F0F8FF}.star:nth-child(19){--star-tail-length:5.92em;--top-offset:64.35vh;--fall-duration:10.953s;--fall-delay:2.431s;--star-color:#F8F8FF}.star:nth-child(20){--star-tail-length:5.02em;--top-offset:2.1vh;--fall-duration:6.289s;--fall-delay:1.946s;--star-color:#F0E68C}.star:nth-child(21){--star-tail-length:6.18em;--top-offset:80.41vh;--fall-duration:6.12s;--fall-delay:7.476s;--star-color:#FFFACD}.star:nth-child(22){--star-tail-length:7.11em;--top-offset:53.29vh;--fall-duration:8.831s;--fall-delay:0.469s;--star-color:#FFF8DC}.star:nth-child(23){--star-tail-length:5.67em;--top-offset:12.87vh;--fall-duration:9.442s;--fall-delay:9.955s;--star-color:#FFFFF0}.star:nth-child(24){--star-tail-length:6.94em;--top-offset:31.65vh;--fall-duration:10.738s;--fall-delay:3.663s;--star-color:#FFFAF0}.star:nth-child(25){--star-tail-length:5.99em;--top-offset:79.36vh;--fall-duration:11.366s;--fall-delay:5.84s;--star-color:#FAF0E6}.star:nth-child(26){--star-tail-length:5.82em;--top-offset:9.65vh;--fall-duration:7.405s;--fall-delay:8.235s;--star-color:#FFF0F5}.star:nth-child(27){--star-tail-length:5.56em;--top-offset:85.52vh;--fall-duration:8.121s;--fall-delay:9.337s;--star-color:#FFE4E1}.star:nth-child(28){--star-tail-length:6.95em;--top-offset:10.78vh;--fall-duration:11.924s;--fall-delay:6.187s;--star-color:#FFDAB9}.star:nth-child(29){--star-tail-length:7.25em;--top-offset:28.76vh;--fall-duration:10.255s;--fall-delay:5.851s;--star-color:#FFEFD5}.star:nth-child(30){--star-tail-length:5.94em;--top-offset:12.59vh;--fall-duration:8.123s;--fall-delay:0.559s;--star-color:#FFE4B5}.star:nth-child(31){--star-tail-length:5.77em;--top-offset:52.58vh;--fall-duration:6.647s;--fall-delay:8.408s;--star-color:#FFDAB9}.star:nth-child(32){--star-tail-length:6.31em;--top-offset:70.41vh;--fall-duration:9.456s;--fall-delay:0.365s;--star-color:#FFEFD5}.star:nth-child(33){--star-tail-length:5.33em;--top-offset:72.14vh;--fall-duration:10.853s;--fall-delay:3.079s;--star-color:#FFFACD}.star:nth-child(34){--star-tail-length:6.5em;--top-offset:94.58vh;--fall-duration:6.216s;--fall-delay:7.007s;--star-color:#FFFFF0}.star:nth-child(35){--star-tail-length:6.78em;--top-offset:90.12vh;--fall-duration:6.511s;--fall-delay:1.076s;--star-color:#FFF5EE}.star:nth-child(36){--star-tail-length:6.47em;--top-offset:24.74vh;--fall-duration:7.948s;--fall-delay:2.584s;--star-color:#FFF8DC}.star:nth-child(37){--star-tail-length:6.98em;--top-offset:93vh;--fall-duration:8.767s;--fall-delay:5.115s;--star-color:#FFFAF0}.star:nth-child(38){--star-tail-length:6.2em;--top-offset:50.52vh;--fall-duration:8.839s;--fall-delay:8.817s;--star-color:#F0FFF0}.star:nth-child(39){--star-tail-length:6.82em;--top-offset:40.96vh;--fall-duration:11.768s;--fall-delay:9.079s;--star-color:#F5FFFA}.star:nth-child(40){--star-tail-length:6.03em;--top-offset:54.2vh;--fall-duration:10.202s;--fall-delay:6.822s;--star-color:#F0F8FF}.star:nth-child(41){--star-tail-length:5.38em;--top-offset:26.08vh;--fall-duration:6.575s;--fall-delay:4.124s;--star-color:#F8F8FF}.star:nth-child(42){--star-tail-length:6.93em;--top-offset:17.53vh;--fall-duration:6.199s;--fall-delay:4.022s;--star-color:#FFFFF0}.star:nth-child(43){--star-tail-length:6.75em;--top-offset:88.33vh;--fall-duration:11.161s;--fall-delay:8.707s;--star-color:#FFF0F5}.star:nth-child(44){--star-tail-length:5.13em;--top-offset:76.61vh;--fall-duration:10.428s;--fall-delay:3.501s;--star-color:#FFE4E1}.star:nth-child(45){--star-tail-length:5.06em;--top-offset:0.99vh;--fall-duration:8.699s;--fall-delay:4.056s;--star-color:#FFDAB9}.star:nth-child(46){--star-tail-length:5.13em;--top-offset:94.35vh;--fall-duration:8.019s;--fall-delay:6.262s;--star-color:#FFEFD5}.star:nth-child(47){--star-tail-length:6.21em;--top-offset:22.35vh;--fall-duration:9.456s;--fall-delay:3.124s;--star-color:#FFE4B5}.star:nth-child(48){--star-tail-length:5.86em;--top-offset:37.32vh;--fall-duration:10.168s;--fall-delay:6.439s;--star-color:#F0E68C}.star:nth-child(49){--star-tail-length:6.25em;--top-offset:70.76vh;--fall-duration:10.88s;--fall-delay:6.028s;--star-color:#FFFFE0}.star:nth-child(50){--star-tail-length:5.38em;--top-offset:29.35vh;--fall-duration:6.618s;--fall-delay:1.419s;--star-color:#FFF5EE}.star::after,.star::before{position:absolute;content:'';top:0;left:calc(var(--star-width)/ -2);width:var(--star-width);height:100%;background:linear-gradient(45deg,transparent,currentColor,transparent);border-radius:inherit;animation:blink 2s linear infinite}.star::before{transform:rotate(45deg)}.star::after{transform:rotate(-45deg)}@keyframes fall{to{transform:translate3d(-30em,0,0)}}@keyframes tail-fade{0%,50%{width:var(--star-tail-length);opacity:1}70%,80%{width:0;opacity:.4}100%{width:0;opacity:0}}@keyframes blink{50%{opacity:.6}}</style></head><body><div class="stars"><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div></div></body></html>`;

export const floatingShapes = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Animated Circles</title><link href="https://fonts.googleapis.com/css?family=Exo:400,700" rel="stylesheet"><style>*{margin:0;padding:0}body{font-family:Exo,sans-serif}.context{width:100%;position:absolute;top:50vh}.context h1{text-align:center;color:#fff;font-size:50px}.area{background:#4e54c8;background:-webkit-linear-gradient(to left,#8f94fb,#4e54c8);width:100%;height:100vh}.circles{position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden}.circles li{position:absolute;display:block;list-style:none;width:20px;height:20px;background:rgba(255,255,255,.2);animation:animate 25s linear infinite;bottom:-150px}.circles li:nth-child(1){left:25%;width:80px;height:80px;animation-delay:0s}.circles li:nth-child(2){left:10%;width:20px;height:20px;animation-delay:2s;animation-duration:12s}.circles li:nth-child(3){left:70%;width:20px;height:20px;animation-delay:4s}.circles li:nth-child(4){left:40%;width:60px;height:60px;animation-delay:0s;animation-duration:18s}.circles li:nth-child(5){left:65%;width:20px;height:20px;animation-delay:0s}.circles li:nth-child(6){left:75%;width:110px;height:110px;animation-delay:3s}.circles li:nth-child(7){left:35%;width:150px;height:150px;animation-delay:7s}.circles li:nth-child(8){left:50%;width:25px;height:25px;animation-delay:15s;animation-duration:45s}.circles li:nth-child(9){left:20%;width:15px;height:15px;animation-delay:2s;animation-duration:35s}.circles li:nth-child(10){left:85%;width:150px;height:150px;animation-delay:0s;animation-duration:11s}@keyframes animate{0%{transform:translateY(0) rotate(0);opacity:1;border-radius:0}100%{transform:translateY(-1000px) rotate(720deg);opacity:0;border-radius:50%}}</style></head><body><div class="area"><ul class="circles"><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul></div></body></html>`;

export const imageParallax = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HTML/CSS Combined</title><style>*{margin:0;padding:0}body,html{width:100%;height:100%;overflow:hidden}body{background-color:#021027}.container{width:100%;height:100%;overflow:hidden;position:relative}.background{display:block;position:absolute;top:0;left:0;object-fit:cover;width:100%;height:100%;mask-image:radial-gradient(white 0,#fff 30%,transparent 80%,transparent)}.circle-container{position:absolute;transform:translateY(-10vh);animation-iteration-count:infinite;animation-timing-function:linear}.circle{width:100%;height:100%;border-radius:50%;mix-blend-mode:screen;background-image:radial-gradient(#99feff,#99feff 10%,hsla(180,100%,80%,0) 56%);animation:fade-frames .2s infinite,scale-frames 2s infinite}@keyframes fade-frames{0%{opacity:1}50%{opacity:.7}100%{opacity:1}}@keyframes scale-frames{0%{transform:scale3d(.4,.4,1)}50%{transform:scale3d(2.2,2.2,1)}100%{transform:scale3d(.4,.4,1)}}.message{position:absolute;right:20px;bottom:10px;color:#fff;font-family:"Josefin Slab",serif;line-height:27px;font-size:18px;text-align:right;pointer-events:none;animation:message-frames 1.5s ease 5s forwards;opacity:0}@keyframes message-frames{from{opacity:0}to{opacity:1}}.circle-container:nth-child(1){width:8px;height:8px;animation-name:move-frames-1;animation-duration:37s;animation-delay:4s}.circle-container:nth-child(1) .circle{animation-delay:4s}@keyframes move-frames-1{from{transform:translate3d(10vw,110vh,0)}to{transform:translate3d(90vw,-110vh,0)}}.circle-container:nth-child(2){width:6px;height:6px;animation-name:move-frames-2;animation-duration:36s;animation-delay:3s}.circle-container:nth-child(2) .circle{animation-delay:3s}@keyframes move-frames-2{from{transform:translate3d(20vw,120vh,0)}to{transform:translate3d(80vw,-120vh,0)}}.circle-container:nth-child(3){width:7px;height:7px;animation-name:move-frames-3;animation-duration:35s;animation-delay:2s}.circle-container:nth-child(3) .circle{animation-delay:2s}@keyframes move-frames-3{from{transform:translate3d(30vw,130vh,0)}to{transform:translate3d(70vw,-130vh,0)}}.circle-container:nth-child(4){width:5px;height:5px;animation-name:move-frames-4;animation-duration:34s;animation-delay:1s}.circle-container:nth-child(4) .circle{animation-delay:1s}@keyframes move-frames-4{from{transform:translate3d(40vw,140vh,0)}to{transform:translate3d(60vw,-140vh,0)}}.circle-container:nth-child(5){width:8px;height:8px;animation-name:move-frames-5;animation-duration:33s;animation-delay:.5s}.circle-container:nth-child(5) .circle{animation-delay:.5s}@keyframes move-frames-5{from{transform:translate3d(50vw,150vh,0)}to{transform:translate3d(50vw,-150vh,0)}}.circle-container:nth-child(6){width:7px;height:7px;animation-name:move-frames-6;animation-duration:32s;animation-delay:4s}.circle-container:nth-child(6) .circle{animation-delay:4s}@keyframes move-frames-6{from{transform:translate3d(60vw,160vh,0)}to{transform:translate3d(40vw,-160vh,0)}}.circle-container:nth-child(7){width:6px;height:6px;animation-name:move-frames-7;animation-duration:31s;animation-delay:3s}.circle-container:nth-child(7) .circle{animation-delay:3s}@keyframes move-frames-7{from{transform:translate3d(70vw,170vh,0)}to{transform:translate3d(30vw,-170vh,0)}}.circle-container:nth-child(8){width:5px;height:5px;animation-name:move-frames-8;animation-duration:30s;animation-delay:2s}.circle-container:nth-child(8) .circle{animation-delay:2s}@keyframes move-frames-8{from{transform:translate3d(80vw,180vh,0)}to{transform:translate3d(20vw,-180vh,0)}}.circle-container:nth-child(9){width:8px;height:8px;animation-name:move-frames-9;animation-duration:29s;animation-delay:1s}.circle-container:nth-child(9) .circle{animation-delay:1s}@keyframes move-frames-9{from{transform:translate3d(90vw,190vh,0)}to{transform:translate3d(10vw,-190vh,0)}}.circle-container:nth-child(10){width:7px;height:7px;animation-name:move-frames-10;animation-duration:28s;animation-delay:.5s}.circle-container:nth-child(10) .circle{animation-delay:.5s}@keyframes move-frames-10{from{transform:translate3d(100vw,200vh,0)}to{transform:translate3d(0,-200vh,0)}}.circle-container:nth-child(11){width:6px;height:6px;animation-name:move-frames-11;animation-duration:27s;animation-delay:4s}.circle-container:nth-child(11) .circle{animation-delay:4s}@keyframes move-frames-11{from{transform:translate3d(110vw,210vh,0)}to{transform:translate3d(-10vw,-210vh,0)}}.circle-container:nth-child(12){width:5px;height:5px;animation-name:move-frames-12;animation-duration:26s;animation-delay:3s}@keyframes move-frames-2{from{transform:translate3d(20vw,120vh,0)}to{transform:translate3d(80vw,-120vh,0)}}.circle-container:nth-child(13){width:8px;height:8px;animation-name:move-frames-100;animation-duration:28s;animation-delay:1s}.circle-container:nth-child(13) .circle{animation-delay:1s}@keyframes move-frames-100{from{transform:translate3d(100vw,100vh,0)}to{transform:translate3d(0,-100vh,0)}}</style></head><body><div class="container"><img src="https://github.com/Nounspace/nounspace.ts/blob/main/public/images/nounspace_og.png?raw=true" class="background"><p class="message">to infinity and beyond</p><div class="circle-container"><div class="circle"></div></div><div class="circle-container"><div class="circle"></div></div><div class="circle-container"><div class="circle"></div></div><div class="circle-container"><div class="circle"></div></div><div class="circle-container"><div class="circle"></div></div><div class="circle-container"><div class="circle"></div></div><div class="circle-container"><div class="circle"></div></div><div class="circle-container"><div class="circle"></div></div><div class="circle-container"><div class="circle"></div></div><div class="circle-container"><div class="circle"></div></div><div class="circle-container"><div class="circle"></div></div><div class="circle-container"><div class="circle"></div></div><div class="circle-container"><div class="circle"></div></div><div class="circle-container"><div class="circle"></div></div></div></body></html>`;

export const retro = `<html><head><style>html,body{height:100%}body{background-image:linear-gradient(0deg, rgba(253,253,253,1) 0%, rgba(203,213,224,1) 100%);background-repeat:no-repeat;}</style></head><body></body></html>`;

export const nounish = `<html><head><style>html,body{height:100%}body{background-image:radial-gradient(circle, rgba(255,250,250,1) 0%, rgba(255,232,232,1) 100%);;background-repeat:no-repeat;}</style></head><body></body></html>`;

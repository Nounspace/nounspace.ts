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
</head>
<body></body>
</html>
`;

export const gradientAndWave = `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            0% {
                background-position: 0% 0%;
            }
            50% {
                background-position: 100% 100%;
            }
            100% {
                background-position: 0% 0%;
            }
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
            /* z-index: -1;*/
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
            2% {
                transform: translateX(1);
            }
            25% {
                transform: translateX(-25%);
            }
            50% {
                transform: translateX(-50%);
            }
            75% {
                transform: translateX(-25%);
            }
            100% {
                transform: translateX(1);
            }
        }
    </style>
</head>
<body>
    <div>
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
    </div>
</body>
</html>
`;

export const colorBlobs = `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>SVG Animation</title>
    <style>
        body {
            background-color: #fee440;
            margin: 0;
            padding: 0;
        }
        svg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
        }
        .links {
            position: fixed;
            bottom: 20px;
            right: 20px;
            font-size: 18px;
            font-family: sans-serif;
        }
        a {
            text-decoration: none;
            color: #000;
            margin-left: 1em;
        }
        a:hover {
            text-decoration: underline;
        }
        a img.icon {
            display: inline-block;
            height: 1em;
            margin: 0 0 -0.1em 0.3em;
        }
        @keyframes rotate {
            0% {
                transform: rotate(0);
            }
            100% {
                transform: rotate(360deg);
            }
        }
        .out-top {
            animation: rotate 20s linear infinite;
            transform-origin: 13px 25px;
        }
        .in-top {
            animation: rotate 10s linear infinite;
            transform-origin: 13px 25px;
        }
        .out-bottom {
            animation: rotate 25s linear infinite;
            transform-origin: 84px 93px;
        }
        .in-bottom {
            animation: rotate 15s linear infinite;
            transform-origin: 84px 93px;
        }
    </style>
</head>
<body>
    <svg preserveAspectRatio="xMidYMid slice" viewBox="10 10 80 80">
        <path fill="#9b5de5" class="out-top" d="M37-5C25.1-14.7,5.7-19.1-9.2-10-28.5,1.8-32.7,31.1-19.8,49c15.5,21.5,52.6,22,67.2,2.3C59.4,35,53.7,8.5,37-5Z"/>
        <path fill="#f15bb5" class="in-top" d="M20.6,4.1C11.6,1.5-1.9,2.5-8,11.2-16.3,23.1-8.2,45.6,7.4,50S42.1,38.9,41,24.5C40.2,14.1,29.4,6.6,20.6,4.1Z"/>
        <path fill="#00bbf9" class="out-bottom" d="M105.9,48.6c-12.4-8.2-29.3-4.8-39.4.8-23.4,12.8-37.7,51.9-19.1,74.1s63.9,15.3,76-5.6c7.6-13.3,1.8-31.1-2.3-43.8C117.6,63.3,114.7,54.3,105.9,48.6Z"/>
        <path fill="#00f5d4" class="in-bottom" d="M102,67.1c-9.6-6.1-22-3.1-29.5,2-15.4,10.7-19.6,37.5-7.6,47.8s35.9,3.9,44.5-12.5C115.5,92.6,113.9,74.6,102,67.1Z"/>
    </svg>
>
</body>
</html>
`;

export const shootingStar = `
<html>
<head>
<style>
@media screen and (max-width:750px) {
  .star {
    animation: fall 9s 6.845s linear infinite
  }
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: radial-gradient(ellipse at bottom, #0d1d31 0, #0c0d13 100%);
  overflow: hidden;
}

.stars {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 120%;
  transform: rotate(-45deg);
}

.star {
  position: absolute;
  top: 66.26vh;
  left: 0;
  width: 6em;
  height: 2px;
  color: #FFF4C4;
  background: linear-gradient(45deg, currentColor, transparent);
  border-radius: 50%;
  filter: drop-shadow(0 0 6px currentColor);
  transform: translate3d(104em, 0, 0);
  animation: fall 9s 6.845s linear infinite, tail-fade 9s 6.845s ease-out infinite;
}

.star::after,
.star::before {
  position: absolute;
  content: '';
  top: 0;
  left: calc(1em / -2);
  width: 1em;
  height: 100%;
  background: linear-gradient(45deg, transparent, currentColor, transparent);
  border-radius: inherit;
  animation: blink 2s linear infinite;
}

.star::before {
  transform: rotate(45deg);
}

.star::after {
  transform: rotate(-45deg);
}

@keyframes fall {
  to {
    transform: translate3d(-30em, 0, 0);
  }
}

@keyframes tail-fade {
  0%, 50% {
    width: 6em;
    opacity: 1;
  }
  70%, 80% {
    width: 0;
    opacity: .4;
  }
  100% {
    width: 0;
    opacity: 0;
  }
}

@keyframes blink {
  50% {
    opacity: .6;
  }
}

.star:nth-child(1) { top: 66.26vh; animation-duration: 9.397s; animation-delay: 6.845s; color: #FFF4C4; }
.star:nth-child(2) { top: 22.11vh; animation-duration: 10.252s; animation-delay: 0.776s; color: #FFD700; }
.star:nth-child(3) { top: 60.77vh; animation-duration: 7.865s; animation-delay: 9.192s; color: #FFF8DC; }
.star:nth-child(4) { top: 26.11vh; animation-duration: 6.215s; animation-delay: 3.028s; color: #FFE4B5; }
.star:nth-child(5) { top: 34.09vh; animation-duration: 6.613s; animation-delay: 8.54s; color: #FFDAB9; }
.star:nth-child(6) { top: 59.3vh; animation-duration: 8.58s; animation-delay: 9.71s; color: #FFEFD5; }
.star:nth-child(7) { top: 60.39vh; animation-duration: 11.042s; animation-delay: 2.45s; color: #FFEBCD; }
.star:nth-child(8) { top: 74.01vh; animation-duration: 9.523s; animation-delay: 4.499s; color: #FFE4E1; }
.star:nth-child(9) { top: 25.24vh; animation-duration: 7.484s; animation-delay: 5.277s; color: #FFDAB9; }
.star:nth-child(10) { top: 46.03vh; animation-duration: 8.326s; animation-delay: 6.699s; color: #FFF0F5; }
.star:nth-child(11) { top: 85.73vh; animation-duration: 9.024s; animation-delay: 7.167s; color: #FFE4C4; }
.star:nth-child(12) { top: 57.21vh; animation-duration: 11.552s; animation-delay: 0.136s; color: #FFFACD; }
.star:nth-child(13) { top: 94.94vh; animation-duration: 9.768s; animation-delay: 7.759s; color: #FAFAD2; }
.star:nth-child(14) { top: 0.77vh; animation-duration: 9.42s; animation-delay: 0.412s; color: #FFFFE0; }
.star:nth-child(15) { top: 37.99vh; animation-duration: 9.219s; animation-delay: 9.572s; color: #FFF5EE; }
.star:nth-child(16) { top: 74.31vh; animation-duration: 11.444s; animation-delay: 8.965s; color: #F0FFF0; }
.star:nth-child(17) { top: 73.1vh; animation-duration: 10.709s; animation-delay: 2.344s; color: #F5FFFA; }
.star:nth-child(18) { top: 38.91vh; animation-duration: 11.112s; animation-delay: 3.949s; color: #F0F8FF; }
.star:nth-child(19) { top: 64.35vh; animation-duration: 10.953s; animation-delay: 2.431s; color: #F8F8FF; }
.star:nth-child(20) { top: 2.1vh; animation-duration: 6.289s; animation-delay: 1.946s; color: #F0E68C; }
.star:nth-child(21) { top: 80.41vh; animation-duration: 6.12s; animation-delay: 7.476s; color: #FFFACD; }
.star:nth-child(22) { top: 53.29vh; animation-duration: 8.831s; animation-delay: 0.469s; color: #FFF8DC; }
.star:nth-child(23) { top: 12.87vh; animation-duration: 9.442s; animation-delay: 9.955s; color: #FFFFF0; }
.star:nth-child(24) { top: 31.65vh; animation-duration: 10.738s; animation-delay: 3.663s; color: #FFFAF0; }
.star:nth-child(25) { top: 79.36vh; animation-duration: 11.366s; animation-delay: 5.84s; color: #FAF0E6; }
.star:nth-child(26) { top: 9.65vh; animation-duration: 7.405s; animation-delay: 8.235s; color: #FFF0F5; }
.star:nth-child(27) { top: 85.52vh; animation-duration: 8.121s; animation-delay: 9.337s; color: #FFE4E1; }
.star:nth-child(28) { top: 10.78vh; animation-duration: 11.924s; animation-delay: 6.187s; color: #FFDAB9; }
.star:nth-child(29) { top: 28.76vh; animation-duration: 10.255s; animation-delay: 5.851s; color: #FFEFD5; }
.star:nth-child(30) { top: 12.59vh; animation-duration: 8.123s; animation-delay: 0.559s; color: #FFE4B5; }
.star:nth-child(31) { top: 52.58vh; animation-duration: 6.647s; animation-delay: 8.408s; color: #FFDAB9; }
.star:nth-child(32) { top: 70.41vh; animation-duration: 9.456s; animation-delay: 0.365s; color: #FFEFD5; }
</style>
</head>
<body>
<div class="stars">
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
</div>
</body>
</html>
`;

export const floatingShapes = `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Animated Circles</title>
    <link href="https://fonts.googleapis.com/css?family=Exo:400,700" rel="stylesheet">
    <style>
        * {
            margin: 0px;
            padding: 0px;
        }

        body {
            font-family: 'Exo', sans-serif;
        }

        .context {
            width: 100%;
            position: absolute;
            top: 50vh;
        }

        .context h1 {
            text-align: center;
            color: #fff;
            font-size: 50px;
        }

        .area {
            background: #4e54c8;
            background: -webkit-linear-gradient(to left, #8f94fb, #4e54c8);
            width: 100%;
            height: 100vh;
        }

        .circles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        .circles li {
            position: absolute;
            display: block;
            list-style: none;
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.2);
            animation: animate 25s linear infinite;
            bottom: -150px;
        }

        .circles li:nth-child(1) {
            left: 25%;
            width: 80px;
            height: 80px;
            animation-delay: 0s;
        }

        .circles li:nth-child(2) {
            left: 10%;
            width: 20px;
            height: 20px;
            animation-delay: 2s;
            animation-duration: 12s;
        }

        .circles li:nth-child(3) {
            left: 70%;
            width: 20px;
            height: 20px;
            animation-delay: 4s;
        }

        .circles li:nth-child(4) {
            left: 40%;
            width: 60px;
            height: 60px;
            animation-delay: 0s;
            animation-duration: 18s;
        }

        .circles li:nth-child(5) {
            left: 65%;
            width: 20px;
            height: 20px;
            animation-delay: 0s;
        }

        .circles li:nth-child(6) {
            left: 75%;
            width: 110px;
            height: 110px;
            animation-delay: 3s;
        }

        .circles li:nth-child(7) {
            left: 35%;
            width: 150px;
            height: 150px;
            animation-delay: 7s;
        }

        .circles li:nth-child(8) {
            left: 50%;
            width: 25px;
            height: 25px;
            animation-delay: 15s;
            animation-duration: 45s;
        }

        .circles li:nth-child(9) {
            left: 20%;
            width: 15px;
            height: 15px;
            animation-delay: 2s;
            animation-duration: 35s;
        }

        .circles li:nth-child(10) {
            left: 85%;
            width: 150px;
            height: 150px;
            animation-delay: 0s;
            animation-duration: 11s;
        }

        @keyframes animate {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
                border-radius: 0;
            }

            100% {
                transform: translateY(-1000px) rotate(720deg);
                opacity: 0;
                border-radius: 50%;
            }
        }
    </style>
</head>
<body>
    <div class="area">
        <ul class="circles">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
        </ul>
    </div>
</body>
</html>
`;

export const imageParallax = `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML/CSS Combined</title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }

        html,
        body {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        body {
            background-color: #021027;
        }

        .container {
            width: 100%;
            height: 100%;
            overflow: hidden;
            position: relative;
        }

        .background {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            object-fit: cover;
            width: 100%;
            height: 100%;
            mask-image: radial-gradient(
                white 0%,
                white 30%,
                transparent 80%,
                transparent
            );
        }

        .circle-container {
            position: absolute;
            transform: translateY(-10vh);
            animation-iteration-count: infinite;
            animation-timing-function: linear;
        }

        .circle {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            mix-blend-mode: screen;
            background-image: radial-gradient(
                hsl(180, 100%, 80%),
                hsl(180, 100%, 80%) 10%,
                hsla(180, 100%, 80%, 0) 56%
            );

            animation: fade-frames 200ms infinite, scale-frames 2s infinite;
        }

        @keyframes fade-frames {
            0% {
                opacity: 1;
            }

            50% {
                opacity: 0.7;
            }

            100% {
                opacity: 1;
            }
        }

        @keyframes scale-frames {
            0% {
                transform: scale3d(0.4, 0.4, 1);
            }

            50% {
                transform: scale3d(2.2, 2.2, 1);
            }

            100% {
                transform: scale3d(0.4, 0.4, 1);
            }
        }

        .message {
            position: absolute;
            right: 20px;
            bottom: 10px;
            color: white;
            font-family: "Josefin Slab", serif;
            line-height: 27px;
            font-size: 18px;
            text-align: right;
            pointer-events: none;
            animation: message-frames 1.5s ease 5s forwards;
            opacity: 0;
        }

        @keyframes message-frames {
            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }
        }

        /* Dynamic CSS for each circle */
        .circle-container:nth-child(1) { width: 8px; height: 8px; animation-name: move-frames-1; animation-duration: 37000ms; animation-delay: 4000ms; }
        .circle-container:nth-child(1) .circle { animation-delay: 4000ms; }
        @keyframes move-frames-1 { from { transform: translate3d(10vw, 110vh, 0); } to { transform: translate3d(90vw, -110vh, 0); } }

        .circle-container:nth-child(2) { width: 6px; height: 6px; animation-name: move-frames-2; animation-duration: 36000ms; animation-delay: 3000ms; }
        .circle-container:nth-child(2) .circle { animation-delay: 3000ms; }
        @keyframes move-frames-2 { from { transform: translate3d(20vw, 120vh, 0); } to { transform: translate3d(80vw, -120vh, 0); } }

        .circle-container:nth-child(3) { width: 7px; height: 7px; animation-name: move-frames-3; animation-duration: 35000ms; animation-delay: 2000ms; }
        .circle-container:nth-child(3) .circle { animation-delay: 2000ms; }
        @keyframes move-frames-3 { from { transform: translate3d(30vw, 130vh, 0); } to { transform: translate3d(70vw, -130vh, 0); } }

        .circle-container:nth-child(4) { width: 5px; height: 5px; animation-name: move-frames-4; animation-duration: 34000ms; animation-delay: 1000ms; }
        .circle-container:nth-child(4) .circle { animation-delay: 1000ms; }
        @keyframes move-frames-4 { from { transform: translate3d(40vw, 140vh, 0); } to { transform: translate3d(60vw, -140vh, 0); } }

        .circle-container:nth-child(5) { width: 8px; height: 8px; animation-name: move-frames-5; animation-duration: 33000ms; animation-delay: 500ms; }
        .circle-container:nth-child(5) .circle { animation-delay: 500ms; }
        @keyframes move-frames-5 { from { transform: translate3d(50vw, 150vh, 0); } to { transform: translate3d(50vw, -150vh, 0); } }

        .circle-container:nth-child(6) { width: 7px; height: 7px; animation-name: move-frames-6; animation-duration: 32000ms; animation-delay: 4000ms; }
        .circle-container:nth-child(6) .circle { animation-delay: 4000ms; }
        @keyframes move-frames-6 { from { transform: translate3d(60vw, 160vh, 0); } to { transform: translate3d(40vw, -160vh, 0); } }

        .circle-container:nth-child(7) { width: 6px; height: 6px; animation-name: move-frames-7; animation-duration: 31000ms; animation-delay: 3000ms; }
        .circle-container:nth-child(7) .circle { animation-delay: 3000ms; }
        @keyframes move-frames-7 { from { transform: translate3d(70vw, 170vh, 0); } to { transform: translate3d(30vw, -170vh, 0); } }

        .circle-container:nth-child(8) { width: 5px; height: 5px; animation-name: move-frames-8; animation-duration: 30000ms; animation-delay: 2000ms; }
        .circle-container:nth-child(8) .circle { animation-delay: 2000ms; }
        @keyframes move-frames-8 { from { transform: translate3d(80vw, 180vh, 0); } to { transform: translate3d(20vw, -180vh, 0); } }

        .circle-container:nth-child(9) { width: 8px; height: 8px; animation-name: move-frames-9; animation-duration: 29000ms; animation-delay: 1000ms; }
        .circle-container:nth-child(9) .circle { animation-delay: 1000ms; }
        @keyframes move-frames-9 { from { transform: translate3d(90vw, 190vh, 0); } to { transform: translate3d(10vw, -190vh, 0); } }

        .circle-container:nth-child(10) { width: 7px; height: 7px; animation-name: move-frames-10; animation-duration: 28000ms; animation-delay: 500ms; }
        .circle-container:nth-child(10) .circle { animation-delay: 500ms; }
        @keyframes move-frames-10 { from { transform: translate3d(100vw, 200vh, 0); } to { transform: translate3d(0vw, -200vh, 0); } }

        .circle-container:nth-child(11) { width: 6px; height: 6px; animation-name: move-frames-11; animation-duration: 27000ms; animation-delay: 4000ms; }
        .circle-container:nth-child(11) .circle { animation-delay: 4000ms; }
        @keyframes move-frames-11 { from { transform: translate3d(110vw, 210vh, 0); } to { transform: translate3d(-10vw, -210vh, 0); } }

        .circle-container:nth-child(12) { width: 5px; height: 5px; animation-name: move-frames-12; animation-duration: 26000ms; animation-delay: 3000ms; }
        @keyframes move-frames-2 { from { transform: translate3d(20vw, 120vh, 0); } to { transform: translate3d(80vw, -120vh, 0); } }      
        .circle-container:nth-child(13) { width: 8px; height: 8px; animation-name: move-frames-100; animation-duration: 28000ms; animation-delay: 1000ms; }
        .circle-container:nth-child(13) .circle { animation-delay: 1000ms; }
        @keyframes move-frames-100 { from { transform: translate3d(100vw, 100vh, 0); } to { transform: translate3d(0vw, -100vh, 0); } }
    </style>
</head>
<!-- To change the background image, replace the img src below with your image address -->
<!-- To change the text displayed, replace the message below -->
<body>
    <div class="container">
        <img src="https://nounspace.com/images/rainforest.png?raw=true" class="background">
        <p class="message">to infinity and beyond</p>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
        <div class="circle-container"><div class="circle"></div></div>
    </div>
</body>
</html>
`;

export const retro = `<html><head><style>html,body{height:100%}body{background-image:linear-gradient(0deg, rgba(253,253,253,1) 0%, rgba(203,213,224,1) 100%);background-repeat:no-repeat;}</style></head><body></body></html>`;

export const nounish = `<html><head><style>html,body{height:100%}body{background-image:radial-gradient(circle, rgba(255,250,250,1) 0%, rgba(255,232,232,1) 100%);;background-repeat:no-repeat;}</style></head><body></body></html>`;

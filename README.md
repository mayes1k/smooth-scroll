smooth-scroll.js

A lightweight JavaScript library for smooth, inertial scrolling. No dependencies required.

Features

* Smooth mouse wheel and trackpad scrolling
* Keyboard navigation support
* Smooth in-page anchor navigation
* Inertial scrolling animation
* Support for nested scrollable elements
* Respects prefers-reduced-motion
* No external dependencies
* Automatic initialization

Installation

Download smooth-scroll.js and add it to your project.

Direct Installation

Include the script before the closing </body> tag:

<script src="js/smooth-scroll.js"></script>

Example project structure:

your-project/
├── index.html
└── js/
    └── smooth-scroll.js

CDN Installation

You can also load the file using jsDelivr:

<script src="https://cdn.jsdelivr.net/gh/USERNAME/REPOSITORY/smooth-scroll.js"></script>

Replace USERNAME and REPOSITORY with your GitHub username and repository name.

Usage

Once installed, the library initializes automatically. No additional configuration is required.

Anchor Navigation

Use regular HTML anchor links:

<a href="#about">About</a>
<section id="about">
    <h2>About</h2>
</section>

Clicking the link will smoothly scroll to the corresponding section.

JavaScript API

The library provides a global SmoothScroll object with three methods.

Scroll to a position:

SmoothScroll.scrollTo(500);

Scroll to an element:

SmoothScroll.scrollTo(
    document.getElementById("about")
);

Customize duration and offset:

SmoothScroll.scrollTo(
    document.getElementById("about"),
    {
        duration: 1000,
        offset: 80
    }
);

Stop scrolling:

SmoothScroll.stop();

Destroy the library:

SmoothScroll.destroy();

Browser Compatibility

smooth-scroll.js is designed for desktop browsers only.

Browser	Support
Google Chrome	Supported
Mozilla Firefox	Supported
Microsoft Edge	Supported
Safari (macOS)	Supported
Opera	Supported
Mobile browsers	Not supported

Note: The custom scrolling effect is disabled on devices detected as having a coarse pointer, such as most touch-based devices.

Requirements

* Desktop environment
* Modern web browser
* JavaScript enabled
* No additional libraries or frameworks

Accessibility

The library respects the prefers-reduced-motion system preference.

When reduced motion is enabled, animated scrolling is disabled and scrolling happens immediately instead.

Performance

The animation uses requestAnimationFrame() and linear interpolation (LERP) to create smooth scrolling without external animation libraries.

The script is designed to remain lightweight and easy to integrate into existing projects.

Open Source

smooth-scroll.js is free and open-source.

You can explore the source code, use it in your projects, modify it, and contribute improvements.

Contributing

Suggestions, bug reports, and contributions are welcome.

Feel free to open an issue or submit a pull request.

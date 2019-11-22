# Ganymede

An [Electron](https://electronjs.org/) app providing a lightweight wrapper around [Jupyter Lab](https://jupyterlab.readthedocs.io/en/stable/) to turn it into a desktop application.

## What is this?

**Note:** This is not an official part of the Jupyter project; anything good about this is thanks to them and any bugs are thanks to me!

The basic thing that I wanted was to separate my Jupyter Lab instances from my browser so that they could run in an independent workspace (leading to less clutter and fewer distractions).
The added bonus is that this app spins up the Jupyter Lab instances itself so you won't always have a pile of terminals running Jupyter instances.
This app does the trick for me, but it's a pile of hacks so it might not work for you.
If you feel the urge to report or fix bugs, please do!

This project is meant to sit somewhere between [running Jupyter in Chrome's app mode](http://christopherroach.com/articles/jupyterlab-desktop-app/) and fully featured apps like [Jupyterlab app](https://github.com/jupyterlab/jupyterlab_app) and [nteract](https://nteract.io/).
The idea is that I want it to be lightweight (it shouldn't really add features to Jupyter Lab), but have the convenience features that I want.

## Usage

I've never worked with Electron or Node before this so feel free to correct these steps if you have more experience!
The code has been developed and tested on macOS and it should probably work on at least some flavors of Linux, but it'll probably need some work if you want to run it on Windows.

**Mac binary:** Mac builds are available under [Releases](https://github.com/dfm/Ganymede/releases), but I don't have a Mac developer key so it'll show some warnings. If you trust me, you can right-click and select "Open" to bypass the warnings.

**Development version:** You'll need to install the [Yarn package manager](https://yarnpkg.com/en/) then:

1. Clone the repository: `git clone https://github.com/dfm/Ganymede.git; cd Ganymede`
2. Install the dependencies: `yarn`
3. Start the dev version of the app: `yarn dev`
4. Build the production version of the app: `yarn dist`
5. Launch the app from the `dist` directory

If you're on a Mac, you should be able to open `.ipynb` files in Ganymede by double clicking (or right-clicking and using "Open with").

## Troubleshooting

**PATH/environment issues**: It's generally still easiest to launch Ganymede using the command line so that you get your standard environment. To do this, launch the app as usual and then select "Install CLI" from the file menu. This will install a script in `/usr/local/bin` so that you can run `ganymede /path/to/a/directory` to open the app in that directory. This only works on macOS so far!

## License

Copyright 2019 Dan Foreman-Mackey

This project is licensed under the terms of the MIT License (see [LICENSE](LICENSE)).

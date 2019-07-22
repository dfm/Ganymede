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

## License

Copyright 2019 Dan Foreman-Mackey

This project is licensed under the terms of the MIT License (see [LICENSE](LICENSE)).

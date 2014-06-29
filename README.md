# Quickpass

Quickpass is a Mozilla Firefox add-on that lets you autocomplete usernames and
passwords from a [KeePassX][keepassx] database using one easy keyboard shortcut.

[keepassx]: http://keepassx.org/

## Disclaimer

I should start by letting you know that I'm no security expert, and I just
hacked this addon because I was tired of having to open KeePassX every time
I had to log into an application.

While Quickpass reuses KeePassX source code as much as possible to try to
minimize the number of vulnerabilities, it's very likely that such
vulnerabilities exist.

I am in no way responsible for any loss or damage that may result directly or
indirectly from the use of this program. I do not recommend using this program
to handle sensitive information such as home banking passwords.

## License

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.

Some parts of this program are covered by the more permissive BSD 3-Clause
license and you are free to distribute and/or modify those parts under the
terms of such license.

## How Do I Use It?

1. Download the latest version of Quickpass as an XPI package (not yet
	 available, sorry).

2. Install the add-on using Firefox's Add-Ons Manager "Install Add-On from
   File..." feature.

3. Configure the extension clicking on the "Preferences" button in Firefox's
   Add-Ons Manager. It's very important that you complete this step as you need
   to point Quickpass to the correct KeePassX database file.

4. Go to your favourite web app.

5. Focus the username field and press `CTRL+k`.

6. Enter your passphrase.

7. Focus the password field and press `CTRL+k`.

8. Your username and password should have been autocompleted for you by
   Quickpass!

## How Does It Work?

If you press `CTRL+k` while an input field is focused, Quickpass will open the
KeePassX database and will search for an entry whose URL field matches the
current website's URL. If a match is found, then the username field of the
entry will be pasted into the input field, unless the value of the HTML `type`
attribute of the input field is `password`, in which case the password will be
pasted.

For this approach to work, it's very important that the URLs you store in the
KeePassX database are patterns instead of exact matches. For example,
`https://accounts.google.com/*` will work fine if you want to use Quickpass to
log into Google's applications, however `https://accounts.google.com/` won't
work.

## How Do I Contribute?

The project is very young, so there are many things that can be improved and
many features that are missing.

Please feel free to contribute anything you think might be useful to others,
including suggestions, source code, bug reports and/or documentation.

## How Do I Build It From Source?

### Introduction

The add-on is divided in two parts, organized as two folders under the root of
the project:

- `keepassx_cbind`: a small set of C functions that wrap the KeePassX features
  used by the add-on. To compile this part you need to meet all KeePassX
  pre-requisites which you can find [here][keepassx-install]. In adittion you
  need CMake version 2.8.11 -or newer- and Git.

- `addon`: the code of the Firefox extension itself. To run and compile the
  add-on you need to install the [Mozilla Add-On SDK][addon-sdk]

[keepassx-install]: https://www.keepassx.org/dev/projects/keepassx/wiki/Install_instructions
[addon-sdk]: https://developer.mozilla.org/en-US/Add-ons/SDK

### Get The Source Code

Getting the source is pretty easy, just run:

    git clone git@github.com:jgrande/quickpass.git

In the following steps it is assumed that `quickpass` is the name of the folder
where the source code was downloaded.

### Compile KeePassX's C Bindings

To compile in Windows you will need to come up with your own steps as I've
never done that so far. However it should be easy enough since CMake is used as
the build system, and you can use the steps below as a starting point.

To compile the KeePassX C bindings in Linux or OS X follow these steps:

    cd quickpass/keepassx_cbind
    mkdir build
    cd build
    cmake ..
    make
    make install

The first three steps create the folder where all the build-related files are
going to live. The fourth step invokes `cmake` to initialize the build system.
The fifth step invokes `make` to fetch KeePassX's source code, compile all
C/C++ files and build the dynamic library. Finally, the sixth step copies the
library to a folder where the extension can find it, i.e: `addon/data/lib`.

### Run The Add-On

Before running the add-on, make sure that there is a keepassx_cbind library
available for the add-on to use. The library should be in `addon/data/lib` and
the name depends on the platform you are using, as shown by the following
table:

OS    | Architecture | Name
------|--------------|------------------------------------
Linux | 64-bits      | libkeepassx_cbind.Linux_x86_64.so
OS X  | 64-bits      | libkeepassx_cbind.Darwin_x86_64.so

You can obtain a library by compiling it from source code, or downloading one
of the already compiled versions (not yet available, sorry).

Running the add-on is very easy using the Mozilla Add-On SDK. After activating
the SDK, run the following command:

    cd quickpass/addon
    cfx run

You should see a new Firefox window. First of all, configure the add-on to
point to a test database. Then you can then open `addon/test/test.html` and
test the add-on by pressing `CTRL+k` in the input fields.

I would recommend you to run the add-on using a profile so preferences are
persisted accross runs:

    cfx run -p profile

This command will create a new profile in the `profile` folder, which is already
listed in the `.gitignore` file, so it won't be seen by Git.

### Build The XPI Package

After running the add-on, and once you're happy with the changes you've made,
you can assemble your code into a new XPI package. Doing that is very easy too:

    cfx xpi

You can then install your version of the add-on in the same way you did with
any XPI package.

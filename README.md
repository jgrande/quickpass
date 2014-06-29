Quickpass is a Mozilla Firefox add-on that lets you autocomplete usernames and
passwords from a KeePassX database using one easy keyboard shortcut.

# Disclaimer

I should start by letting you know that I'm no security expert, and I just
hacked this addon because I was tired of having to open KeePassX every time
I had to log into an application.

While Quickpass makes use of KeePassX source code as much as possible to try to
avoid incorporating new vulnerabilities, it's very likely that such
vulnerabilities exist.

# License

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

# How To Use

1. Download the latest version of Quickpass as an XPI package (not yet
	 available, sorry).
2. Install the add-on using Firefox's Add-Ons Manager "Install Add-On from
   File..." feature.
3. Configure the plugin clicking on the "Preferences" button in Firefox's
   Add-Ons Manager. It's very important that you complete this step as you
  	need to point Quickpass to the correct KeePassX database file.
4. Go to your favourite web app.
5. Move focus to the "Username" field and press `CTRL+k`.
6. Enter your passphrase.
7. Move focus to the "Password" field and press `CTRL+k`.
8. Your username and password should have been autocompleted for you by
   Quickpass!

# How Does It Work?

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

# How Do I Build It From Source?

## Pre-requisites

To Be Done.

## Get The Source Code

To Be Done.

## Compile KeePassX's C Bindings

To Be Done.

## Run The Add-On

To Be Done.

# Contributions

The project is very young, so there are many things that can be improved and
many features that can be implemented.

Please feel free to contribute anything you think might be useful to others,
including suggestions, source code, bug reports and/or documentation.

# a silly spotify search tool

leverage overlap in your spotify playlist search results to create the most _
playlist

## run this website locally

**This requires that you have node/npm installed.**

Follow these steps, if you want to run this website yourself:

Go to the [spotify developer portal](https://developer.spotify.com/), log in and
create an application. Make sure you add a callback URI for the adress you want
to host this page on, by default  

    http://localhost:5000

Once you're finished clone this repository by running  

    git clone https://github.com/sebastian-stubenvoll/themostplaylist.git

and create a file called settings.js in the root directory that looks like this

    export const clientID = YOURCLIENTID
    export const redirect_uri = YOURREDIRECTURI
    export const pushURL = YOURURLPATH

where you replace `YOURCLIENTID` with the client ID from your spotify developer dashboard
and `YOURREDIRECTURI` with the redirect URI you added in your application settings.
`YOURURLPATH` is the path that will be pushed to the browser window after logging in
successfully. Change this so it matches the host address if you want the rollup auto
refresh feature to work. If you're unsure just set it to `"/"`.

Now run `npm i` to install all dependencies and finally run your application by executing

    npm run dev

## contribute

I wrote this project pretty much in a day while I was at home sick in an attempt to distract myself.
So while there's probably an abundance of things that can be improved, I most likely won't be
making any changes other than ones required for a quota extension from spotify.  

If you want to make any improvements feel free to submit a pull request and I'll
take a look!


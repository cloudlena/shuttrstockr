# Shuttrstockr

A simple command line tool which downloads a series of images from [Shutterstock](http://www.shutterstock.com/) concerning a predefined search term. Additinally it creates a `.csv` file to save the metadata of each file. This is all achieved using the [Shutterstock API](https://developers.shutterstock.com/).

## Usage

1. Run `npm start` to get an overview
1. Provide your Shutterstock API credentials as parameters
1. Run `node shuttrstockr search --id <shutterstock-api-client-id> --secret <shutterstock-api-client-secret> --number <number-of-images-to-download> --abbreviation <image-prefix> <search-term>`

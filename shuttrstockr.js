#!/usr/bin/env node

/* eslint-disable max-len */

'use strict';

const appInfo = require('./package');
const fs = require('fs');
const os = require('os');
const program = require('commander');
const shutterstock = require('shutterstock');
const request = require('request');

/**
 * Download a file
 * @param {string} uri the URI of the file
 * @param {string} filename the name of the file to save
 * @param {function} callback the callback of the function
 * @returns {void}
 */
function download(uri, filename, callback) {
  request.head(uri, (err) => {
    if (err) throw err;

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
}

program.version(appInfo.version);

program
  .command('search <searchTerm>')
  .alias('s')
  .option('-i, --id <Client ID>', 'Your Shutterstock API Client ID')
  .option('-s, --secret <Client Secret>', 'Your Shutterstock API Client Secret')
  .option('-p, --path [path]', 'The location to save the images to')
  .option('-n, --number <number>', 'The number of images to download')
  .option(
    '-a, --abbreviation <abbreviation>',
    'The prefix to add to the image name'
  )
  .description('Search the Shutterstock API')
  .action((searchTerm, options) => {
    const query = {};
    const api = shutterstock.v2({
      clientId: options.id,
      clientSecret: options.secret
    });
    let numPages = 1;
    let keywords = '';
    let resultString = '';

    query.query = searchTerm;

    query.license = [
      'commercial',
      'enhanced'
    ];

    if (options.path) {
      options.path = `${options.path}/`;
    } else {
      options.path = '';
    }

    if (options.number) {
      if (options.number <= 50) {
        query.per_page = options.number;
      } else {
        query.per_page = 50;
        numPages = Math.floor(options.number / 50);
      }
    }

    for (let j = 0; j < numPages; j++) {
      query.page = j + 1;

      let i = 0;

      api.image.search(query, (err1, data1) => { // eslint-disable-line
        if (err1) throw err1;

        /**
         * get a single image and download it
         * @returns {void}
         */
        function getImageDetails() {
          const fromPrevPages = 50 * j;
          const imgIndex = i + fromPrevPages;

          keywords = '';
          setTimeout(() => {

            api.image.get(data1.data[i].id, (err2, data) => {
              if (err2) throw err2;

              if (data.keywords) {
                for (let k = 0; k < data.keywords.length; k++) {
                  if (k === data.keywords.length - 1) {
                    keywords += data.keywords[k];
                  }
                  keywords += `${data.keywords[k]}, `;
                }
              } else {
                keywords = '';
              }
              resultString = `${imgIndex}|shutterstock-${options.abbreviation}-${imgIndex}-${data.id}|${keywords}|${data.id}${os.EOL}`;
              fs.appendFile('data.txt', resultString, (err3) => {
                if (err3) throw err3;
              });

              download(
                data.assets.preview.url,
                `${options.path}shutterstock-${options.abbreviation}-${imgIndex}-${data.id}.jpg`,
                () => {
                  console.log(`downloaded shutterstock-${options.abbreviation}-${imgIndex}-${data.id}.jpg`);
                }
              );
            });

            i++;
            if (i < data1.data.length) {
              getImageDetails();
            }

          }, 1000);
        }
        getImageDetails();

      });
    }
  });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}

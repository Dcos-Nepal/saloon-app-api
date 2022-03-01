export const randomString = (length = 60) => {
  let output = '';

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    output += characters[Math.floor(Math.random() * length)];
  }

  return output;
};

export const randomStringCaps = (length = 5) => {
  let output = '';

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < length; i++) {
    output += characters[Math.floor(Math.random() * length)];
  }

  return output;
};

export const randomNumbers = (length = 5) => {
  let output = '';

  const characters = '0123456789';

  for (let i = 0; i < length; i++) {
    output += characters[Math.floor(Math.random() * length)];
  }

  return output;
};

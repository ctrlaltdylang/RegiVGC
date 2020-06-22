/* eslint-disable no-undef */
function gigantimax(gigantimax) {
  if (!gigantimax) return;

  gigantimax.on('change', (e) => {
    console.log(e)
    if (e.target.value === '0' || e.target.value === 'X') {
      e.target.value = gigantimax.id.split('x')[1];
    } else {
      e.target.value = 'X';
    }
  });
}

export default gigantimax;

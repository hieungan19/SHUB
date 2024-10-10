const axios = require('axios');

async function fetchData() {
  // Gọi API lấy dữ liệu
  const response = await axios.get(
    'https://test-share.shub.edu.vn/api/intern-test/input'
  );
  console.log('Request data: ', response.data);
  return response.data;
}

function createpreSums(data) {
  const n = data.length;
  const preSum = new Array(n + 1).fill(0);
  const evenOddSum = new Array(n + 1).fill(0); // Mảng cho tổng chẵn lẻ

  for (let i = 1; i <= n; i++) {
    preSum[i] = preSum[i - 1] + data[i - 1];

    // Tính tổng chẵn và lẻ
    evenOddSum[i] =
      evenOddSum[i - 1] + (i % 2 === 0 ? data[i - 1] : -data[i - 1]);
  }

  return { preSum, evenOddSum };
}

function processQueries(queries, preSum, evenOddSum) {
  return queries.map((query) => {
    const [l, r] = query.range;
    if (query.type === '1') {
      // Loại 1
      return preSum[r + 1] - preSum[l];
    } else if (query.type === '2') {
      // Loại 2
      return evenOddSum[r + 1] - evenOddSum[l]; // r + 1 vì evenOddSum có thêm 1 phần tử
    }
  });
}

async function main() {
  try {
    const data = await fetchData();
    const { token, data: arr, query } = data;

    const { preSum, evenOddSum } = createpreSums(arr);

    const results = processQueries(query, preSum, evenOddSum);

    const response = await axios.post(
      'https://test-share.shub.edu.vn/api/intern-test/output',
      results,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Results: ', results);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Chạy chương trình
main();

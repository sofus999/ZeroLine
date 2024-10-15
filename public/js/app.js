document.addEventListener('DOMContentLoaded', async () => {
  // Fetch alerts from the backend when the page loads
  try {
    const response = await fetch('/api/alerts');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const alerts = await response.json();
    const alertsContainer = document.getElementById('alerts-container');
    alertsContainer.innerHTML = ''; // Clear the container before rendering

    // If no alerts, display a message
    if (alerts.length === 0) {
      alertsContainer.innerHTML = '<p>No alerts to display.</p>';
    }

    // Render each alert dynamically
    alerts.forEach((alert) => {
      const alertElement = document.createElement('div');
      alertElement.classList.add('alert');

      alertElement.innerHTML = `
        <h2>Alert #${alert.id} - ${alert.alert_type}</h2>
        <p><strong>Hostname:</strong> ${alert.hostname}</p>
        <p><strong>Error Message:</strong> ${alert.error_message}</p>
        <p><strong>Suggested Solution:</strong> ${alert.suggestion}</p>
        <p><strong>CMDB Info:</strong> ${alert.cmdb_info}</p>
        <p><strong>Recent Incidents:</strong> ${alert.recent_incidents}</p>
        <button class="feedback-button" data-id="${alert.id}">Provide Feedback</button>
      `;

      alertsContainer.appendChild(alertElement);
    });

    // Add event listeners to feedback buttons
    document.querySelectorAll('.feedback-button').forEach(button => {
      button.addEventListener('click', openFeedbackModal);
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
  }
});

function openFeedbackModal(event) {
  const alertId = event.target.getAttribute('data-id');
  const modal = document.getElementById('feedbackModal');
  modal.style.display = 'block';

  const feedbackForm = document.getElementById('feedback-form');
  feedbackForm.onsubmit = async function (e) {
    e.preventDefault();
    const feedback = document.getElementById('feedback').value;

    try {
      const response = await fetch(`/api/alerts/${alertId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      });

      const result = await response.json();
      console.log('Feedback submitted:', result);

      // Close the modal
      modal.style.display = 'none';
      document.getElementById('feedback').value = ''; // Reset feedback input
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };
}

// Close the feedback modal when the "x" is clicked
document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('feedbackModal').style.display = 'none';
});

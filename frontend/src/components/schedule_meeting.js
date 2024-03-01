// Get input values
function scheduleMeeting(){
    const title = document.getElementById('meetingTitle').value;
    const date = document.getElementById('meetingDate').value;
    const time = document.getElementById('meetingTime').value;
    const targetDate = new Date(document.getElementById('meetingDate').value);
    const currentDate = new Date();

    // Combine date and time into a single string
    const dateTimeString = `${date} ${time}`;

    // Parse the combined string into a JavaScript Date object
    const meetingDateTime = new Date(dateTimeString);

    // Check if the date is valid
    if (isNaN(meetingDateTime.getTime())) {
        alert('Invalid date or time. Please check your input.');
        return;
    }
    if (targetDate < currentDate) {
        alert(`Meeting scheduled date must be after: ${currentDate}`);
        return;
    }

    // Display a confirmation message
    alert(`Meeting scheduled!\nTitle: ${title}\nDate and Time: ${meetingDateTime.toLocaleString()}`);
    // You can perform additional actions here, such as sending the meeting details to a server.
}   
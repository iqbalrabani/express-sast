$(document).ready(function () {
    // Fetch user
    $('#user-form').submit(function (e) {
        e.preventDefault();
        const userId = $('#userId').val();
        $.get(`/users?id=${userId}`, function (data) {
            // Clear previous results
            $('#user-display').empty();

            if (data.length === 0) {
                $('#user-display').html('<div class="alert alert-danger">User not found.</div>');
                return;
            }

            // Create a user card for the result
            data.forEach(user => {
                $('#user-display').append(`
                    <div class="user-card">
                        <h5>${user.name}</h5>
                        <p>Email: ${user.email}</p>
                        <button class="btn btn-secondary" onclick="showEditForm(${user.id}, '${user.name}', '${user.email}')">Edit</button>
                    </div>
                `);
            });
        });
    });

    // Show edit form
    window.showEditForm = function (id, name, email) {
        $('#user-display').append(`
            <div class="user-card mt-3" id="edit-form-${id}">
                <h5>Edit User</h5>
                <form>
                    <div class="form-group">
                        <label for="editName">Name</label>
                        <input type="text" class="form-control" id="editName" value="${name}" required>
                    </div>
                    <div class="form-group">
                        <label for="editEmail">Email</label>
                        <input type="email" class="form-control" id="editEmail" value="${email}" required>
                    </div>
                    <button type="button" class="btn btn-success" onclick="saveChanges(${id})">Save Changes</button>
                </form>
            </div>
        `);
    };

    // Save changes
    window.saveChanges = function (id) {
        const updatedName = $('#editName').val();
        const updatedEmail = $('#editEmail').val();

        $.ajax({
            url: `/users/${id}`, // Adjust this URL based on your API
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                name: updatedName,
                email: updatedEmail
            }),
            success: function (response) {
                alert('User updated successfully!');
                $('#user-display').empty(); // Clear user display
            },
            error: function (xhr, status, error) {
                console.error(error);
                alert('Failed to update user.');
            }
        });
    };

    // Submit comment
    $('#comment-form').submit(function(e) {
        e.preventDefault();
        const comment = $('#comment').val();
        $.post('/comment', { comment }, function(data) {
            $('#comment-result').html(data);
        });
    });

    // Encrypt data
    $('#encrypt-form').submit(function(e) {
        e.preventDefault();
        const data = $('#data').val();
        $.post('/encrypt', { data }, function(response) {
            $('#encrypt-result').html(response);
        });
    });

    // Fetch file
    $('#file-form').submit(function(e) {
        e.preventDefault();
        const filename = $('#filename').val();
        $.get(`/file?filename=${filename}`, function(response) {
            $('#file-result').html(response);
        }).fail(function() {
            $('#file-result').html('File not found.');
        });
    });
});
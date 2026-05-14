const supabase = require('../../supabase');

// Save or Update FCM Token for a user
const saveFCMToken = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming auth middleware sets req.user
        const { fcmToken, deviceType } = req.body;

        if (!fcmToken) {
            return res.status(400).json({ error: true, message: 'FCM Token is required' });
        }

        // Upsert the token for the user
        const { error } = await supabase
            .from('user_fcm_tokens')
            .upsert({
                user_id: userId,
                fcm_token: fcmToken,
                device_type: deviceType,
                updated_at: new Date().toISOString()
            }, { onConflict: 'fcm_token' });

        if (error) throw error;

        res.status(200).json({ error: false, message: 'Token saved successfully' });
    } catch (err) {
        console.error('Error saving FCM token:', err);
        res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
};

// Get User Notifications
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const { data, error, count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.status(200).json({
            error: false,
            data,
            total: count
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
};

// Mark Notification as Read
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)
            .eq('user_id', userId);

        if (error) throw error;

        res.status(200).json({ error: false, message: 'Marked as read' });
    } catch (err) {
        console.error('Error marking notification as read:', err);
        res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
};

module.exports = {
    saveFCMToken,
    getUserNotifications,
    markAsRead
};

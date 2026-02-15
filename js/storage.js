// storage.js - API Communication Layer
const API_BASE_URL = 'api';

// Generic API call function
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'خطا در ارتباط با سرور');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load all data from server
async function loadData() {
    try {
        const result = await apiCall('data.php?action=getAll', 'GET');
        return result.data;
    } catch (error) {
        console.error('Error loading data:', error);
        alert('خطا در بارگذاری اطلاعات از سرور');
        return null;
    }
}

// Save all data to server
async function saveData(data) {
    try {
        const result = await apiCall('data.php', 'POST', {
            action: 'saveAll',
            data: data
        });
        return result.success;
    } catch (error) {
        console.error('Error saving data:', error);
        alert('خطا در ذخیره اطلاعات در سرور');
        return false;
    }
}

// Teams API
const TeamsAPI = {
    getAll: async () => {
        const result = await apiCall('teams.php?action=getAll');
        return result.data;
    },
    
    getById: async (id) => {
        const result = await apiCall(`teams.php?action=getById&id=${id}`);
        return result.data;
    },
    
    create: async (team) => {
        const result = await apiCall('teams.php', 'POST', {
            action: 'create',
            team: team
        });
        return result.data;
    },
    
    update: async (id, team) => {
        const result = await apiCall('teams.php', 'POST', {
            action: 'update',
            id: id,
            team: team
        });
        return result.success;
    },
    
    delete: async (id) => {
        const result = await apiCall('teams.php', 'POST', {
            action: 'delete',
            id: id
        });
        return result.success;
    }
};

// Players API
const PlayersAPI = {
    getAll: async () => {
        const result = await apiCall('players.php?action=getAll');
        return result.data;
    },
    
    getByTeam: async (teamId) => {
        const result = await apiCall(`players.php?action=getByTeam&teamId=${teamId}`);
        return result.data;
    },
    
    create: async (player) => {
        const result = await apiCall('players.php', 'POST', {
            action: 'create',
            player: player
        });
        return result.data;
    },
    
    update: async (id, player) => {
        const result = await apiCall('players.php', 'POST', {
            action: 'update',
            id: id,
            player: player
        });
        return result.success;
    },
    
    delete: async (id) => {
        const result = await apiCall('players.php', 'POST', {
            action: 'delete',
            id: id
        });
        return result.success;
    }
};

// Matches API
const MatchesAPI = {
    getAll: async () => {
        const result = await apiCall('matches.php?action=getAll');
        return result.data;
    },
    
    create: async (match) => {
        const result = await apiCall('matches.php', 'POST', {
            action: 'create',
            match: match
        });
        return result.data;
    },
    
    update: async (id, match) => {
        const result = await apiCall('matches.php', 'POST', {
            action: 'update',
            id: id,
            match: match
        });
        return result.success;
    },
    
    delete: async (id) => {
        const result = await apiCall('matches.php', 'POST', {
            action: 'delete',
            id: id
        });
        return result.success;
    }
};

// Transfers API
const TransfersAPI = {
    getAll: async () => {
        const result = await apiCall('transfers.php?action=getAll');
        return result.data;
    },
    
    getPending: async () => {
        const result = await apiCall('transfers.php?action=getPending');
        return result.data;
    },
    
    create: async (transfer) => {
        const result = await apiCall('transfers.php', 'POST', {
            action: 'create',
            transfer: transfer
        });
        return result.data;
    },
    
    approve: async (id) => {
        const result = await apiCall('transfers.php', 'POST', {
            action: 'approve',
            id: id
        });
        return result.success;
    },
    
    reject: async (id) => {
        const result = await apiCall('transfers.php', 'POST', {
            action: 'reject',
            id: id
        });
        return result.success;
    }
};

// Budgets API
const BudgetsAPI = {
    getAll: async () => {
        const result = await apiCall('budgets.php?action=getAll');
        return result.data;
    },
    
    getByTeam: async (teamId) => {
        const result = await apiCall(`budgets.php?action=getByTeam&teamId=${teamId}`);
        return result.data;
    },
    
    update: async (teamId, amount) => {
        const result = await apiCall('budgets.php', 'POST', {
            action: 'update',
            teamId: teamId,
            amount: amount
        });
        return result.success;
    }
};

// Settings API
const SettingsAPI = {
    get: async () => {
        const result = await apiCall('settings.php?action=get');
        return result.data;
    },
    
    update: async (settings) => {
        const result = await apiCall('settings.php', 'POST', {
            action: 'update',
            settings: settings
        });
        return result.success;
    }
};

// Notifications API
const NotificationsAPI = {
    getAll: async () => {
        const result = await apiCall('notifications.php?action=getAll');
        return result.data;
    },
    
    create: async (notification) => {
        const result = await apiCall('notifications.php', 'POST', {
            action: 'create',
            notification: notification
        });
        return result.data;
    },
    
    delete: async (id) => {
        const result = await apiCall('notifications.php', 'POST', {
            action: 'delete',
            id: id
        });
        return result.success;
    }
};

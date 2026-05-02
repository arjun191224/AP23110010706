# Campus Notifications System Design

## Architecture Overview
The system follows a monorepo structure consisting of three main packages:
1. **`logging_middleware`**: A reusable, standalone module for standardized application logging. It captures API requests, errors, and function executions cleanly.
2. **`notification_app_be`**: The logic layer that isolates business rules from the UI. It abstracts the external API communication and implements advanced prioritization logic using a scalable data structure.
3. **`notification_app_fe`**: A React frontend application that consumes the logic layer as a package.

By organizing the system into decoupled workspaces, the architecture remains highly modular and follows Clean Architecture principles. The UI components are completely unaware of how data is fetched or sorted, they merely rely on the outputs provided by the logic layer. 

## Data Flow
1. **User Action / App Initialization**: The React application calls `fetchNotifications()` from the `notification_app_be` package.
2. **Logic Layer API Call**: `notification_app_be` delegates the external HTTP request to the evaluation-service API (with mock fallback if needed).
3. **Logging**: Throughout the process, any API interaction and method execution flows through the `logging_middleware`.
4. **Data Transformation**: The data retrieved is then passed into `sortByPriority()` or `getTopNotifications(notifications, n)`.
5. **State Update**: The React frontend saves this processed list in state and re-renders to display the paginated or filtered views.

## Priority Algorithm Explanation
The system enforces strict business rules for ranking notifications:
- **Placement (3)** > **Result (2)** > **Event (1)**
- For identical categories, newer timestamps are preferred.

These rules are captured in a deterministic `comparePriority(a, b)` function.

## Optimization Approach
To handle continuous incoming data optimally without repeatedly sorting the entire array, `getTopNotifications(notifications, n)` utilizes a **Min-Heap (Priority Queue)** approach. 

### Why a Heap?
If we receive thousands of notifications but only need to display the top `n` priority items, sorting the entire dataset takes `O(M log M)` where `M` is total notifications. 
Using a Min-Heap of size `n`, the time complexity is optimized to `O(M log n)`.
1. The heap maintains the top `n` elements seen so far.
2. Since it is a Min-Heap configured with our custom priority comparator, the "weakest" among the top `n` items is always at the root.
3. When a new notification arrives, if its priority is higher than the root, it replaces the root and we `heapifyDown`, an `O(log n)` operation.

This design is very efficient for streaming large amounts of data.

## Folder Structure Explanation
```text
campus_notifications_system/
│
├── logging_middleware/       # Custom Reusable Logging
│   ├── package.json
│   └── index.js
│
├── notification_app_be/      # Business Logic Layer
│   ├── package.json
│   └── index.js              # Fetch & priority logic
│
├── notification_app_fe/      # React UI
│   ├── src/                  # React Hooks, Components, Pages
│   └── package.json          
│
└── package.json              # Monorepo Workspace configuration
```

import SwiftUI

struct ContentView: View {
    @State private var store = AppStore()

    var body: some View {
        TabView {
            NavigationStack {
                ActiveListView()
            }
            .tabItem {
                Label("Shopping", systemImage: "cart")
            }

            NavigationStack {
                SavedListsView()
            }
            .tabItem {
                Label("Lists", systemImage: "bookmark")
            }
        }
        .environment(store)
    }
}

#Preview {
    ContentView()
}

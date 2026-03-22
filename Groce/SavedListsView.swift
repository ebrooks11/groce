import SwiftUI

struct SavedListsView: View {
    @Environment(AppStore.self) private var store
    @State private var showCreateList = false
    @State private var newListName = ""
    @State private var listToDelete: GroceryList?

    private var sorted: [GroceryList] {
        store.savedLists.sorted { $0.name.localizedCompare($1.name) == .orderedAscending }
    }

    private var showDeleteAlert: Binding<Bool> {
        Binding(
            get: { listToDelete != nil },
            set: { if !$0 { listToDelete = nil } }
        )
    }

    var body: some View {
        Group {
            if sorted.isEmpty {
                emptyState
            } else {
                listContent
            }
        }
        .navigationTitle("Lists")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    showCreateList = true
                } label: {
                    Image(systemName: "plus")
                        .font(.system(size: 18, weight: .semibold))
                }
            }
        }
        .alert("New List", isPresented: $showCreateList) {
            TextField("List name", text: $newListName)
            Button("Create") {
                let name = newListName.trimmingCharacters(in: .whitespaces)
                if !name.isEmpty { store.createSavedList(name: name) }
                newListName = ""
            }
            Button("Cancel", role: .cancel) { newListName = "" }
        } message: {
            Text("Enter a name for your list")
        }
        .alert(
            "Delete \"\(listToDelete?.name ?? "")\"?",
            isPresented: showDeleteAlert
        ) {
            Button("Delete", role: .destructive) {
                if let list = listToDelete { store.deleteSavedList(id: list.id) }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This cannot be undone.")
        }
    }

    // MARK: - Subviews

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "bookmark")
                .font(.system(size: 48))
                .foregroundColor(Color(.systemGray4))
            Text("No saved lists yet")
                .font(.headline)
            Text("Create lists for recipes, weekly essentials, and more.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground))
    }

    private var listContent: some View {
        List {
            ForEach(sorted) { list in
                NavigationLink(destination: SavedListDetailView(listId: list.id)) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(list.name)
                            .font(.body)
                            .fontWeight(.medium)
                        Text(list.items.count == 1 ? "1 item" : "\(list.items.count) items")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 2)
                }
                .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                    Button(role: .destructive) {
                        listToDelete = list
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
    }
}

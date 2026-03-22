import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "cart")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Hello, Groce!")
        }
        .padding()
    }
}

#Preview {
    ContentView()
}

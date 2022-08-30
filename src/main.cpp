#include <cstdio>
#include <memory>
#include <stdexcept>
#include <string>
#include <array>

#include "crow.h"
#include "liblesma/Driver/Driver.h"

std::string exec(const std::string& filename) {
    std::array<char, 128> buffer{};
    std::string result;
    std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(fmt::format("./{}", filename).c_str(), "r"), pclose);
    if (!pipe) {
        throw std::runtime_error("popen() failed!");
    }
    while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr) {
        result += buffer.data();
    }
    remove(filename.c_str());
    return result;
}

int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/")([](){
        std::string output_filename = std::to_string(rand());
        lesma::Driver::Compile(new lesma::Options{
            lesma::SourceType::STRING,
            "print(\"Hello from lesma!\")",
            lesma::Debug::NONE,
            output_filename
        });
        std::string output = exec(output_filename);
        CROW_LOG_INFO << "Output: " << output << "\n";

        crow::json::wvalue x({{"body", output}});
        return x;
    });

    app.port(18080).multithreaded().run();
}
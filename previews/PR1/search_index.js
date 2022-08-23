var documenterSearchIndex = {"docs":
[{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"EditURL = \"https://github.com/KnutAM/FerriteSolvers.jl/blob/main/docs/src/literate/plasticity.jl\"","category":"page"},{"location":"examples/plasticity/#Plasticity","page":"Plasticity","title":"Plasticity","text":"","category":"section"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"This example is taken from Ferrite.jl's plasticity example and shows how FerriteSolvers can be used to solve this nonlinear problem with time dependent loading.","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"note: Note\nThis example is preliminary, and does not represent good coding practice. This will be improved in the future as the FerriteSolvers package matures","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"First we need to load all required packages","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"using FerriteSolvers, Ferrite, Tensors, SparseArrays, LinearAlgebra, Plots","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"We first include some basic definitions taken and modified from the original example. These definitions are available here: plasticity_definitions.jl","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"include(\"plasticity_definitions.jl\");\nnothing #hide","category":"page"},{"location":"examples/plasticity/#Problem-definition","page":"Plasticity","title":"Problem definition","text":"","category":"section"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"We divide the problem struct into three parts: definitions (def), a buffer (buf), and postprocessing (post) to structure the information and make it easier to save the simulation settings (enough to save def as the others will be created based on this one)","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"struct PlasticityProblem{PD,PB,PP}\n    def::PD\n    buf::PB\n    post::PP\nend","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"PlasticityModel is our def and contain all problem settings (mesh, material, loads, interpolations, etc.)","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"struct PlasticityModel\n    grid\n    interpolation\n    dh\n    material\n    traction_rate\n    dbcs\nend\n\nfunction PlasticityModel()\n    E = 200.0e9\n    H = E/20\n    ν = 0.3\n    σ₀ = 200e6\n    material = J2Plasticity(E, ν, σ₀, H)\n\n    L = 10.0\n    w = 1.0\n    h = 1.0\n\n    traction_rate = 1.e7    # N/s\n\n    n = 2\n    nels = (10n, n, 2n)\n    P1 = Vec((0.0, 0.0, 0.0))\n    P2 = Vec((L, w, h))\n    grid = generate_grid(Tetrahedron, nels, P1, P2)\n    interpolation = Lagrange{3, RefTetrahedron, 1}()\n    dh = create_dofhandler(grid, interpolation)\n    dbcs = create_bc(dh, grid)\n    return PlasticityModel(grid,interpolation,dh,material,traction_rate,dbcs)\nend;\nnothing #hide","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"PlasticityFEBuffer is our buf and contain all problem arrays and other allocated values","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"struct PlasticityFEBuffer\n    cellvalues\n    facevalues\n    K\n    r\n    u\n    states\n    states_old\n    time::Vector # length(time)=1, could use ScalarBuffer instead\nend\n\nfunction build_febuffer(model::PlasticityModel)\n    dh = model.dh\n    n_dofs = ndofs(dh)\n    cellvalues, facevalues = create_values(model.interpolation)\n    u  = zeros(n_dofs)\n    r = zeros(n_dofs)\n    K = create_sparsity_pattern(dh)\n    nqp = getnquadpoints(cellvalues)\n    states = [J2PlasticityMaterialState() for _ in 1:nqp, _ in 1:getncells(model.grid)]\n    states_old = [J2PlasticityMaterialState() for _ in 1:nqp, _ in 1:getncells(model.grid)]\n    return PlasticityFEBuffer(cellvalues,facevalues,K,r,u,states,states_old,[0.0])\nend;\nnothing #hide","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"Finally, we define our post that contains variables that we will save during the simulation","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"struct PlasticityPost{T}\n    umax::Vector{T}\n    tmag::Vector{T}\nend\nPlasticityPost() = PlasticityPost(Float64[],Float64[]);\nnothing #hide","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"To facilitate reuse, we define a function that gives our full problem struct based on the problem definition","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"build_problem(def::PlasticityModel) = PlasticityProblem(def, build_febuffer(def), PlasticityPost());\nnothing #hide","category":"page"},{"location":"examples/plasticity/#Neumann-boundary-conditions","page":"Plasticity","title":"Neumann boundary conditions","text":"","category":"section"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"We then define a separate function for the Neumann boundary conditions (note that this difference to the original example is not required, but only to separate the element assembly and external boundary conditions)","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"function apply_neumann!(model::PlasticityModel,buffer::PlasticityFEBuffer)\n    t = buffer.time[1]\n    nu = getnbasefunctions(buffer.cellvalues)\n    re = zeros(nu)\n    facevalues = buffer.facevalues\n    grid = model.grid\n    traction = Vec((0.0, 0.0, model.traction_rate*t))\n\n    for (i, cell) in enumerate(CellIterator(model.dh))\n        fill!(re, 0)\n        eldofs = celldofs(cell)\n        for face in 1:nfaces(cell)\n            if onboundary(cell, face) && (cellid(cell), face) ∈ getfaceset(grid, \"right\")\n                reinit!(facevalues, cell, face)\n                for q_point in 1:getnquadpoints(facevalues)\n                    dΓ = getdetJdV(facevalues, q_point)\n                    for i in 1:nu\n                        δu = shape_value(facevalues, q_point, i)\n                        re[i] -= (δu ⋅ traction) * dΓ\n                    end\n                end\n            end\n        end\n        buffer.r[eldofs] .+= re\n    end\nend;\nnothing #hide","category":"page"},{"location":"examples/plasticity/#Specialized-functions-for-our-problem","page":"Plasticity","title":"Specialized functions for our problem","text":"","category":"section"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"We first define our \"get\"-functions to get the key arrays for our problem. Note that these functions don't calculate or update anything, that updating is taken care of by update-update_to_next_step! and update_problem! below.","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"FerriteSolvers.getunknowns(p::PlasticityProblem) = p.buf.u;\nFerriteSolvers.getresidual(p::PlasticityProblem) = p.buf.r;\nFerriteSolvers.getjacobian(p::PlasticityProblem) = p.buf.K;\nnothing #hide","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"We then define the function to update the problem to a different time. This is typically used to set time dependent boundary conditions. Here, it is also possible to make an improved guess for the solution to this time step if desired.","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"function FerriteSolvers.update_to_next_step!(p::PlasticityProblem, time)\n    p.buf.time .= time\nend;\nnothing #hide","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"Next, we define the updating of the problem given a new guess to the solution. Note that we use Δu=nothing for the case it is not given, to signal no change. This version is called directly after updatetonext_step! before entering the nonlinear iterations.","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"function FerriteSolvers.update_problem!(p::PlasticityProblem, Δu=nothing)\n    buf = p.buf\n    def = p.def\n    if !isnothing(Δu)\n        apply_zero!(Δu, p.def.dbcs)\n        buf.u .+= Δu\n    end\n    doassemble!(buf.cellvalues, buf.facevalues, buf.K, buf.r,\n                def.grid, def.dh, def.material, buf.u, buf.states, buf.states_old)\n    apply_neumann!(def,buf)\n    apply_zero!(buf.K, buf.r, def.dbcs)\nend;\nnothing #hide","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"In this example, we use the standard convergence criterion that the norm of the free degrees of freedom is less than the iteration tolerance.","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"FerriteSolvers.calculate_convergence_criterion(p::PlasticityProblem) = norm(FerriteSolvers.getresidual(p)[free_dofs(p.def.dbcs)]);\nnothing #hide","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"After convergence, we need to update the state variables.","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"function FerriteSolvers.handle_converged!(p::PlasticityProblem)\n    p.buf.states_old .= p.buf.states\nend;\nnothing #hide","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"As postprocessing, which is called after handle_converged!, we save the maximum displacement as well as the traction magnitude.","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"function FerriteSolvers.postprocess!(p::PlasticityProblem, step)\n    push!(p.post.umax, maximum(abs, FerriteSolvers.getunknowns(p)))\n    push!(p.post.tmag, p.def.traction_rate*p.buf.time[1])\nend;\nnothing #hide","category":"page"},{"location":"examples/plasticity/#Solving-the-problem","page":"Plasticity","title":"Solving the problem","text":"","category":"section"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"First, we define a helper function to plot the results after the solution","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"function plot_results(problem::PlasticityProblem; plt=plot(), label=nothing, markershape=:auto, markersize=4)\n    umax = vcat(0.0, problem.post.umax)\n    tmag = vcat(0.0, problem.post.tmag)\n    plot!(plt, umax, tmag, linewidth=0.5, title=\"Traction-displacement\", label=label,\n        markeralpha=0.75, markershape=markershape, markersize=markersize)\n    ylabel!(plt, \"Traction [Pa]\")\n    xlabel!(plt, \"Maximum deflection [m]\")\n    return plt\nend;\nnothing #hide","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"Finally, we can solve the problem with different time stepping strategies and plot the results","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"function example_solution()\n    def = PlasticityModel()\n\n    # Fixed uniform time steps\n    problem = build_problem(def)\n    solver = FerriteSolver(NewtonSolver(;tolerance=1.0), FixedTimeStepper(25,0.04))\n    solve_ferrite_problem!(solver, problem)\n    plt = plot_results(problem, label=\"uniform\", markershape=:x, markersize=5)\n\n    # Same time steps as Ferrite example\n    problem = build_problem(def)\n    solver = FerriteSolver(NewtonSolver(;tolerance=1.0), FixedTimeStepper(append!([0.], collect(0.5:0.05:1.0))))\n    solve_ferrite_problem!(solver, problem)\n    plot_results(problem, plt=plt, label=\"fixed\", markershape=:circle)\n\n    # Adaptive time stepping\n    problem = build_problem(def)\n    ts = AdaptiveTimeStepper(0.05, 1.0; Δt_min=0.01, Δt_max=0.2)\n    solver = FerriteSolver(NewtonSolver(;tolerance=1.0, maxiter=4), ts)\n    solve_ferrite_problem!(solver, problem)\n    println(problem.buf.time)\n    plot_results(problem, plt=plt, label=\"adaptive\", markershape=:circle)\n    plot!(;legend=:bottomright)\nend;\nnothing #hide","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"Which gives the following result (Image: )","category":"page"},{"location":"examples/plasticity/#Plain-program","page":"Plasticity","title":"Plain program","text":"","category":"section"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"Here follows a version of the program without any comments. The file is also available here: plasticity.jl.","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"using FerriteSolvers, Ferrite, Tensors, SparseArrays, LinearAlgebra, Plots\n\ninclude(\"plasticity_definitions.jl\");\n\nstruct PlasticityProblem{PD,PB,PP}\n    def::PD\n    buf::PB\n    post::PP\nend\n\nstruct PlasticityModel\n    grid\n    interpolation\n    dh\n    material\n    traction_rate\n    dbcs\nend\n\nfunction PlasticityModel()\n    E = 200.0e9\n    H = E/20\n    ν = 0.3\n    σ₀ = 200e6\n    material = J2Plasticity(E, ν, σ₀, H)\n\n    L = 10.0\n    w = 1.0\n    h = 1.0\n\n    traction_rate = 1.e7    # N/s\n\n    n = 2\n    nels = (10n, n, 2n)\n    P1 = Vec((0.0, 0.0, 0.0))\n    P2 = Vec((L, w, h))\n    grid = generate_grid(Tetrahedron, nels, P1, P2)\n    interpolation = Lagrange{3, RefTetrahedron, 1}()\n    dh = create_dofhandler(grid, interpolation)\n    dbcs = create_bc(dh, grid)\n    return PlasticityModel(grid,interpolation,dh,material,traction_rate,dbcs)\nend;\n\nstruct PlasticityFEBuffer\n    cellvalues\n    facevalues\n    K\n    r\n    u\n    states\n    states_old\n    time::Vector # length(time)=1, could use ScalarBuffer instead\nend\n\nfunction build_febuffer(model::PlasticityModel)\n    dh = model.dh\n    n_dofs = ndofs(dh)\n    cellvalues, facevalues = create_values(model.interpolation)\n    u  = zeros(n_dofs)\n    r = zeros(n_dofs)\n    K = create_sparsity_pattern(dh)\n    nqp = getnquadpoints(cellvalues)\n    states = [J2PlasticityMaterialState() for _ in 1:nqp, _ in 1:getncells(model.grid)]\n    states_old = [J2PlasticityMaterialState() for _ in 1:nqp, _ in 1:getncells(model.grid)]\n    return PlasticityFEBuffer(cellvalues,facevalues,K,r,u,states,states_old,[0.0])\nend;\n\nstruct PlasticityPost{T}\n    umax::Vector{T}\n    tmag::Vector{T}\nend\nPlasticityPost() = PlasticityPost(Float64[],Float64[]);\n\nbuild_problem(def::PlasticityModel) = PlasticityProblem(def, build_febuffer(def), PlasticityPost());\n\nfunction apply_neumann!(model::PlasticityModel,buffer::PlasticityFEBuffer)\n    t = buffer.time[1]\n    nu = getnbasefunctions(buffer.cellvalues)\n    re = zeros(nu)\n    facevalues = buffer.facevalues\n    grid = model.grid\n    traction = Vec((0.0, 0.0, model.traction_rate*t))\n\n    for (i, cell) in enumerate(CellIterator(model.dh))\n        fill!(re, 0)\n        eldofs = celldofs(cell)\n        for face in 1:nfaces(cell)\n            if onboundary(cell, face) && (cellid(cell), face) ∈ getfaceset(grid, \"right\")\n                reinit!(facevalues, cell, face)\n                for q_point in 1:getnquadpoints(facevalues)\n                    dΓ = getdetJdV(facevalues, q_point)\n                    for i in 1:nu\n                        δu = shape_value(facevalues, q_point, i)\n                        re[i] -= (δu ⋅ traction) * dΓ\n                    end\n                end\n            end\n        end\n        buffer.r[eldofs] .+= re\n    end\nend;\n\nFerriteSolvers.getunknowns(p::PlasticityProblem) = p.buf.u;\nFerriteSolvers.getresidual(p::PlasticityProblem) = p.buf.r;\nFerriteSolvers.getjacobian(p::PlasticityProblem) = p.buf.K;\n\nfunction FerriteSolvers.update_to_next_step!(p::PlasticityProblem, time)\n    p.buf.time .= time\nend;\n\nfunction FerriteSolvers.update_problem!(p::PlasticityProblem, Δu=nothing)\n    buf = p.buf\n    def = p.def\n    if !isnothing(Δu)\n        apply_zero!(Δu, p.def.dbcs)\n        buf.u .+= Δu\n    end\n    doassemble!(buf.cellvalues, buf.facevalues, buf.K, buf.r,\n                def.grid, def.dh, def.material, buf.u, buf.states, buf.states_old)\n    apply_neumann!(def,buf)\n    apply_zero!(buf.K, buf.r, def.dbcs)\nend;\n\nFerriteSolvers.calculate_convergence_criterion(p::PlasticityProblem) = norm(FerriteSolvers.getresidual(p)[free_dofs(p.def.dbcs)]);\n\nfunction FerriteSolvers.handle_converged!(p::PlasticityProblem)\n    p.buf.states_old .= p.buf.states\nend;\n\nfunction FerriteSolvers.postprocess!(p::PlasticityProblem, step)\n    push!(p.post.umax, maximum(abs, FerriteSolvers.getunknowns(p)))\n    push!(p.post.tmag, p.def.traction_rate*p.buf.time[1])\nend;\n\nfunction plot_results(problem::PlasticityProblem; plt=plot(), label=nothing, markershape=:auto, markersize=4)\n    umax = vcat(0.0, problem.post.umax)\n    tmag = vcat(0.0, problem.post.tmag)\n    plot!(plt, umax, tmag, linewidth=0.5, title=\"Traction-displacement\", label=label,\n        markeralpha=0.75, markershape=markershape, markersize=markersize)\n    ylabel!(plt, \"Traction [Pa]\")\n    xlabel!(plt, \"Maximum deflection [m]\")\n    return plt\nend;\n\nfunction example_solution()\n    def = PlasticityModel()\n\n    # Fixed uniform time steps\n    problem = build_problem(def)\n    solver = FerriteSolver(NewtonSolver(;tolerance=1.0), FixedTimeStepper(25,0.04))\n    solve_ferrite_problem!(solver, problem)\n    plt = plot_results(problem, label=\"uniform\", markershape=:x, markersize=5)\n\n    # Same time steps as Ferrite example\n    problem = build_problem(def)\n    solver = FerriteSolver(NewtonSolver(;tolerance=1.0), FixedTimeStepper(append!([0.], collect(0.5:0.05:1.0))))\n    solve_ferrite_problem!(solver, problem)\n    plot_results(problem, plt=plt, label=\"fixed\", markershape=:circle)\n\n    # Adaptive time stepping\n    problem = build_problem(def)\n    ts = AdaptiveTimeStepper(0.05, 1.0; Δt_min=0.01, Δt_max=0.2)\n    solver = FerriteSolver(NewtonSolver(;tolerance=1.0, maxiter=4), ts)\n    solve_ferrite_problem!(solver, problem)\n    println(problem.buf.time)\n    plot_results(problem, plt=plt, label=\"adaptive\", markershape=:circle)\n    plot!(;legend=:bottomright)\nend;\n\n# This file was generated using Literate.jl, https://github.com/fredrikekre/Literate.jl","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"","category":"page"},{"location":"examples/plasticity/","page":"Plasticity","title":"Plasticity","text":"This page was generated using Literate.jl.","category":"page"},{"location":"nlsolvers/#Nonlinear-solvers","page":"Nonlinear solvers","title":"Nonlinear solvers","text":"","category":"section"},{"location":"nlsolvers/","page":"Nonlinear solvers","title":"Nonlinear solvers","text":"The following nonlinear solves are included","category":"page"},{"location":"nlsolvers/","page":"Nonlinear solvers","title":"Nonlinear solvers","text":"NewtonSolver","category":"page"},{"location":"nlsolvers/#FerriteSolvers.NewtonSolver","page":"Nonlinear solvers","title":"FerriteSolvers.NewtonSolver","text":"NewtonSolver(;maxiter=10, tolerance=1.e-6)\n\nUse the standard NewtonRaphson solver to solve the nonlinear  problem r(x) = 0 with tolerance within the maximum number  of iterations maxiter\n\n\n\n\n\n","category":"type"},{"location":"nlsolvers/#Implementation-of-custom-nonlinear-solvers","page":"Nonlinear solvers","title":"Implementation of custom nonlinear solvers","text":"","category":"section"},{"location":"nlsolvers/","page":"Nonlinear solvers","title":"Nonlinear solvers","text":"A nonlinear solver should support the solve_nonlinear! function specified below. ","category":"page"},{"location":"nlsolvers/","page":"Nonlinear solvers","title":"Nonlinear solvers","text":"FerriteSolvers.solve_nonlinear!","category":"page"},{"location":"nlsolvers/#FerriteSolvers.solve_nonlinear!","page":"Nonlinear solvers","title":"FerriteSolvers.solve_nonlinear!","text":"solve_nonlinear!(solver::FerriteSolver{<:NLS}, problem)\n\nSolve one step in the nonlinear problem, given as r(x) = 0, by using the solver of type NLS. \n\n\n\n\n\n","category":"function"},{"location":"linearsolvers/#Linear-solvers","page":"Linear solvers","title":"Linear solvers","text":"","category":"section"},{"location":"linearsolvers/","page":"Linear solvers","title":"Linear solvers","text":"The following linear solves are included","category":"page"},{"location":"linearsolvers/","page":"Linear solvers","title":"Linear solvers","text":"BackslashSolver","category":"page"},{"location":"linearsolvers/#FerriteSolvers.BackslashSolver","page":"Linear solvers","title":"FerriteSolvers.BackslashSolver","text":"BackslashSolver()\n\nThe standard julia linear solver using Δx = -drdx\n\n\n\n\n\n","category":"type"},{"location":"linearsolvers/#Implementation-of-custom-linear-solvers","page":"Linear solvers","title":"Implementation of custom linear solvers","text":"","category":"section"},{"location":"linearsolvers/","page":"Linear solvers","title":"Linear solvers","text":"A linear solver should support the update_guess! function specified below. ","category":"page"},{"location":"linearsolvers/","page":"Linear solvers","title":"Linear solvers","text":"FerriteSolvers.update_guess!","category":"page"},{"location":"linearsolvers/#FerriteSolvers.update_guess!","page":"Linear solvers","title":"FerriteSolvers.update_guess!","text":"update_guess!(Δx, drdx, r, linearsolver)\n\nUsing the method specified by linearsolver,  solve r + drdx * Δx = 0 for Δx\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#User-problem","page":"User problem","title":"User problem","text":"","category":"section"},{"location":"userfunctions/","page":"User problem","title":"User problem","text":"The key to using the FerriteSolvers.jl package is to define your  problem. This problem should support the following functions in order for the solver to solve your problem.","category":"page"},{"location":"userfunctions/","page":"User problem","title":"User problem","text":"FerriteSolvers.getunknowns\nFerriteSolvers.getresidual\nFerriteSolvers.getjacobian\nFerriteSolvers.update_to_next_step!\nFerriteSolvers.update_problem!\nFerriteSolvers.calculate_convergence_criterion\nFerriteSolvers.handle_converged!\nFerriteSolvers.postprocess!\nFerriteSolvers.setunknowns!","category":"page"},{"location":"userfunctions/#FerriteSolvers.getunknowns","page":"User problem","title":"FerriteSolvers.getunknowns","text":"getunknowns(problem)\n\nReturn the current vector of unknown values\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.getresidual","page":"User problem","title":"FerriteSolvers.getresidual","text":"getresidual(problem)\n\nReturn the current residual vector of the problem\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.getjacobian","page":"User problem","title":"FerriteSolvers.getjacobian","text":"getjacobian(problem)\n\nReturn the current jacobian of the problem\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.update_to_next_step!","page":"User problem","title":"FerriteSolvers.update_to_next_step!","text":"update_to_next_step!(problem, time)\n\nUpdate prescribed values, external loads etc. for the given time Called in the beginning of each new time step.  Note: For adaptive time stepping, it may be called with a lower  time than the previous time if the solution did not converge.\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.update_problem!","page":"User problem","title":"FerriteSolvers.update_problem!","text":"update_problem!(problem, Δx=0*getunknowns(problem))\n\nAssemble the residual and stiffness for x+=Δx. \n\nSome linear solvers may be inaccurate, and if modified stiffness is used  to enforce constraints on x, it is good the force Δx=0 on these components inside this function. \nNote that the function must also support only one argument: problem, this version is called the first time after  update-update_to_next_step! and should default to Δx=0\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.calculate_convergence_criterion","page":"User problem","title":"FerriteSolvers.calculate_convergence_criterion","text":"calculate_convergence_criterion(problem)\n\nCalculate a value to be compared with the tolerance of the nonlinear solver.  A standard case when using Ferrite.jl is norm(getresidual(problem)[Ferrite.free_dofs(dbcs)])  where dbcs::Ferrite.ConstraintHandler\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.handle_converged!","page":"User problem","title":"FerriteSolvers.handle_converged!","text":"handle_converged!(problem)\n\nDo necessary update operations once it is known that the  problem has converged. E.g., update old values to the current.  Only called directly after the problem has converged. \n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.postprocess!","page":"User problem","title":"FerriteSolvers.postprocess!","text":"postprocess!(problem, step)\n\nPerform any postprocessing at the current time and step nr step Called after time step converged, and after handle_converged!\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.setunknowns!","page":"User problem","title":"FerriteSolvers.setunknowns!","text":"setunknowns!(problem, x)\n\nSet the current value of unknowns to x. If getunknowns(problem)  returns a reference to a Vector{<:Number}, this function is not  necessary to define. \n\n\n\n\n\n","category":"function"},{"location":"","page":"Home","title":"Home","text":"CurrentModule = FerriteSolvers","category":"page"},{"location":"#FerriteSolvers","page":"Home","title":"FerriteSolvers","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Documentation for FerriteSolvers.jl.","category":"page"},{"location":"","page":"Home","title":"Home","text":"solve_ferrite_problem!\nFerriteSolver","category":"page"},{"location":"#FerriteSolvers.solve_ferrite_problem!","page":"Home","title":"FerriteSolvers.solve_ferrite_problem!","text":"solve_ferrite_problem!(solver, problem)\n\nSolve a time-dependent problem r(x(t),t)=0 for x(t),  stepping throught the time t, using the solver. The following functions must be defined for the  user-defined problem:\n\ngetunknowns(problem)\ngetresidual(problem)\ngetjacobian(problem)\nupdate_to_next_step!(problem, t)\nupdate_problem!(problem, Δx)\ncalculate_convergence_criterion(problem)\nhandle_converged!(problem)\n\nAdditionally, one can define postprocess!(problem, step) For details on each function above, please see the respective function's documentation under User problem\n\n\n\n\n\n","category":"function"},{"location":"#FerriteSolvers.FerriteSolver","page":"Home","title":"FerriteSolvers.FerriteSolver","text":"FerriteSolver(nlsolver, timestepper)\n\nThe standard solver, with two parts: A nonlinear solver  (see Nonlinear solvers) and a time stepper (see Time steppers). \n\n\n\n\n\n","category":"type"},{"location":"timesteppers/#Time-steppers","page":"Time steppers","title":"Time steppers","text":"","category":"section"},{"location":"timesteppers/","page":"Time steppers","title":"Time steppers","text":"The following time steppers are included","category":"page"},{"location":"timesteppers/","page":"Time steppers","title":"Time steppers","text":"FixedTimeStepper\nAdaptiveTimeStepper","category":"page"},{"location":"timesteppers/#FerriteSolvers.FixedTimeStepper","page":"Time steppers","title":"FerriteSolvers.FixedTimeStepper","text":"FixedTimeStepper(num_steps::int, Δt, t_start=0)\nFixedTimeStepper(t::Vector)\n\nA time stepper which gives fixed time steps. If the convenience interface is used, constant increments are used. Note that  length(t)=num_steps+1 since the first value is just the initial  value and is not an actual step.  \n\n\n\n\n\n","category":"type"},{"location":"timesteppers/#FerriteSolvers.AdaptiveTimeStepper","page":"Time steppers","title":"FerriteSolvers.AdaptiveTimeStepper","text":"AdaptiveTimeStepper(\n    Δt_init::T, t_end::T; \n    t_start=zero(T), Δt_min=Δt_init, Δt_max=typemax(T), \n    change_factor=T(1.5), num_converged_to_increase::Int=1) where T\n\nAn adaptive time stepper, starting with a step Δt_init and with a  maximum time of t_end. The change_factor describes how much the  time step is changed in the case of (a) no convergence:  Δt/=change_factor and (b) converged the last num_converged_to_increase time steps: Δt*=change_factor.\n\n\n\n\n\n","category":"type"},{"location":"timesteppers/#Implementation-of-custom-time-steppers","page":"Time steppers","title":"Implementation of custom time steppers","text":"","category":"section"},{"location":"timesteppers/","page":"Time steppers","title":"Time steppers","text":"A time stepper should support the following functions","category":"page"},{"location":"timesteppers/","page":"Time steppers","title":"Time steppers","text":"FerriteSolvers.initial_time\nFerriteSolvers.islaststep\nFerriteSolvers.update_time","category":"page"},{"location":"timesteppers/#FerriteSolvers.initial_time","page":"Time steppers","title":"FerriteSolvers.initial_time","text":"initial_time(timestepper)\n\nReturn the starting time for the given timestepper\n\n\n\n\n\n","category":"function"},{"location":"timesteppers/#FerriteSolvers.islaststep","page":"Time steppers","title":"FerriteSolvers.islaststep","text":"islaststep(timestepper, time, step)->Bool\n\nReturn true if the current step/time is the last step, return false otherwise \n\n\n\n\n\n","category":"function"},{"location":"timesteppers/#FerriteSolvers.update_time","page":"Time steppers","title":"FerriteSolvers.update_time","text":"update_time(solver::FerriteSolver{<:Any, <:TST}, time, step, converged::Bool)\n\nReturn the next time and step number, depending on if the previous time step converged  or not. If not converged, return the same step but a new_time<time to reduce the  time step. If it is not possible to retry with shorter timestep, throw  ConvergenceError. If converged, update time step as planned.  Note: The full solver is given as input to allow specialization on e.g. if a  Newton iteration has required many iterations, shorten the next time step as a  precausionary step\n\n\n\n\n\n","category":"function"}]
}
